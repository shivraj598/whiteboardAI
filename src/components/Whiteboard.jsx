import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  Canvas,
  PencilBrush,
  Rect,
  Ellipse,
  Line,
  IText,
  ActiveSelection,
  FabricImage,
  Point,
  util,
} from 'fabric'
import {
  makeArrow,
  makeDiamond,
  buildTable,
  buildChart,
} from '../lib/shapes'

const HISTORY_LIMIT = 80
const SHAPE_TOOLS = ['rectangle', 'ellipse', 'diamond', 'line', 'arrow']
const CHART_TYPES = ['bar', 'line', 'pie']

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const Whiteboard = forwardRef(function Whiteboard(
  { settings, onHistoryChange, onEditTable, onToolChange, onZoomChange },
  ref,
) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const settingsRef = useRef(settings)
  const drawRef = useRef(null)
  const panRef = useRef(null)
  const historyRef = useRef({ stack: [], index: -1 })
  const commitTimerRef = useRef(null)
  const tableIdRef = useRef(1)

  settingsRef.current = settings

  const applyShape = (type, x0, y0, x1, y1, s) => {
    const left = Math.min(x0, x1)
    const top = Math.min(y0, y1)
    const w = Math.abs(x1 - x0)
    const h = Math.abs(y1 - y0)
    const stroke = s.strokeColor
    const strokeWidth = s.strokeWidth
    const fill = s.useFill ? s.fillColor : 'transparent'
    switch (type) {
      case 'rectangle':
        return new Rect({
          left,
          top,
          width: w,
          height: h,
          fill,
          stroke,
          strokeWidth,
          strokeLineJoin: 'round',
          objectCaching: false,
        })
      case 'ellipse':
        return new Ellipse({
          left,
          top,
          rx: w / 2,
          ry: h / 2,
          fill,
          stroke,
          strokeWidth,
          objectCaching: false,
        })
      case 'diamond':
        return makeDiamond(left, top, w, h, { fill, stroke, strokeWidth })
      case 'line':
        return new Line([x0, y0, x1, y1], {
          fill: '',
          stroke,
          strokeWidth,
          strokeLineCap: 'round',
          objectCaching: false,
        })
      case 'arrow':
        return makeArrow(x0, y0, x1, y1, { stroke, strokeWidth })
      default:
        return null
    }
  }

  const sceneCenter = () => {
    const canvas = canvasRef.current
    const vp = canvas.viewportTransform
    return util.sendPointToPlane(
      new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
      undefined,
      vp,
    )
  }

  const updateHistoryState = () => {
    const h = historyRef.current
    onHistoryChange?.({
      canUndo: h.index > 0,
      canRedo: h.index < h.stack.length - 1,
    })
  }

  const HISTORY_PROPS = [
    'id',
    'isTable',
    'tableRows',
    'tableCols',
    'tableData',
    'isChart',
    'chartType',
    'chartData',
  ]

  const commitHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const state = JSON.stringify(canvas.toObject(HISTORY_PROPS))
    const h = historyRef.current
    h.stack = h.stack.slice(0, h.index + 1)
    h.stack.push(state)
    if (h.stack.length > HISTORY_LIMIT) h.stack.shift()
    h.index = h.stack.length - 1
    updateHistoryState()
  }

  const restoreFromHistory = (index) => {
    const canvas = canvasRef.current
    const h = historyRef.current
    const vpt = [...canvas.viewportTransform]
    canvas
      .loadFromJSON(h.stack[index])
      .then(() => {
        canvas.setViewportTransform(vpt)
        canvas.requestRenderAll()
        updateHistoryState()
      })
      .catch(() => {})
  }

  const undo = () => {
    const h = historyRef.current
    if (h.index <= 0) return
    h.index -= 1
    restoreFromHistory(h.index)
  }

  const redo = () => {
    const h = historyRef.current
    if (h.index >= h.stack.length - 1) return
    h.index += 1
    restoreFromHistory(h.index)
  }

  const applyToolState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const tool = settingsRef.current.tool
    const s = settingsRef.current
    const active = canvas.getActiveObject()
    if (active && active.exitEditing) active.exitEditing()
    if (tool === 'draw') {
      canvas.isDrawingMode = true
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
      canvas.freeDrawingBrush = new PencilBrush(canvas)
      canvas.freeDrawingBrush.color = s.strokeColor
      canvas.freeDrawingBrush.width = Math.max(1, s.strokeWidth * 2.5)
    } else if (tool === 'select') {
      canvas.isDrawingMode = false
      canvas.selection = true
      canvas.defaultCursor = 'default'
      canvas.hoverCursor = 'move'
    } else if (tool === 'pan') {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'grab'
    } else {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
    }
    canvas.discardActiveObject()
    canvas.requestRenderAll()
  }

  const createTextAt = (x, y) => {
    const canvas = canvasRef.current
    const s = settingsRef.current
    const text = new IText('', {
      left: x,
      top: y,
      fontSize: s.fontSize,
      fontFamily: s.fontFamily,
      fill: s.strokeColor,
      editable: true,
      padding: 6,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()
    setTimeout(() => {
      if (!text.canvas) return
      text.enterEditing()
      text.selectAll()
    }, 0)
  }

  const onMouseDown = (opt) => {
    const canvas = canvasRef.current
    const tool = settingsRef.current.tool
    if (tool === 'pan') {
      canvas.discardActiveObject()
      panRef.current = {
        startX: opt.viewportPoint.x,
        startY: opt.viewportPoint.y,
        vpt: [...canvas.viewportTransform],
      }
      canvas.defaultCursor = 'grabbing'
      canvas.requestRenderAll()
      return
    }
    if (SHAPE_TOOLS.includes(tool)) {
      // Excalidraw-style smart selection: if the pointer lands on an existing
      // object, select and move it instead of drawing a new shape on top of it.
      // Fabric already set up its drag transform for the target at this point,
      // so we only need to NOT start a shape and make the selection visible.
      const existing = opt.target
      if (existing && existing.selectable !== false && !existing.isEditing) {
        canvas.setActiveObject(existing)
        canvas.defaultCursor = 'move'
        canvas.requestRenderAll()
        return
      }
      const p = canvas.getScenePoint(opt.e)
      drawRef.current = { type: tool, startX: p.x, startY: p.y, obj: null }
      return
    }
    if (tool === 'text') {
      const p = canvas.getScenePoint(opt.e)
      createTextAt(p.x, p.y)
    }
  }

  const upsertShape = () => {
    const canvas = canvasRef.current
    const draw = drawRef.current
    if (!draw) return
    const s = settingsRef.current
    const obj = applyShape(draw.type, draw.startX, draw.startY, draw.endX, draw.endY, s)
    if (draw.obj) canvas.remove(draw.obj)
    draw.obj = obj
    canvas.add(obj)
    canvas.requestRenderAll()
  }

  const onMouseMove = (opt) => {
    const canvas = canvasRef.current
    if (panRef.current) {
      const { startX, startY, vpt } = panRef.current
      const dx = opt.viewportPoint.x - startX
      const dy = opt.viewportPoint.y - startY
      const zoom = canvas.getZoom()
      const next = [...vpt]
      next[4] = vpt[4] + dx / zoom
      next[5] = vpt[5] + dy / zoom
      canvas.setViewportTransform(next)
      canvas.requestRenderAll()
      return
    }
    // Give move-affordance cursor when a shape tool hovers an existing object.
    const tool = settingsRef.current.tool
    if (!drawRef.current && SHAPE_TOOLS.includes(tool)) {
      const over = opt.target && opt.target.selectable !== false
      canvas.defaultCursor = over ? 'move' : 'crosshair'
    }
    const draw = drawRef.current
    if (!draw) return
    const p = canvas.getScenePoint(opt.e)
    draw.endX = p.x
    draw.endY = p.y
    upsertShape()
  }

  const onMouseUp = () => {
    const canvas = canvasRef.current
    if (panRef.current) {
      panRef.current = null
      canvas.defaultCursor = 'grab'
      return
    }
    const draw = drawRef.current
    if (!draw) return
    drawRef.current = null
    const obj = draw.obj
    if (obj) {
      const w = Math.abs(draw.endX - draw.startX)
      const h = Math.abs(draw.endY - draw.startY)
      if (w < 3 && h < 3) {
        canvas.remove(obj)
      } else {
        commitHistory()
      }
      canvas.requestRenderAll()
    }
  }

  const onPathCreated = ({ path }) => {
    const s = settingsRef.current
    path.set({
      fill: '',
      stroke: s.strokeColor,
      strokeWidth: Math.max(1, s.strokeWidth * 2.5),
      objectCaching: false,
    })
    commitHistory()
  }

  const onObjectModified = () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    commitTimerRef.current = setTimeout(commitHistory, 300)
  }

  const onTextExited = ({ target }) => {
    const canvas = canvasRef.current
    if (target && target.text.trim() === '') {
      canvas.remove(target)
    }
    commitHistory()
  }

  const onDblClick = (opt) => {
    const target = opt.target
    if (target && target.isTable && onEditTable) {
      onEditTable({
        id: target.id,
        rows: target.tableRows,
        cols: target.tableCols,
        data: target.tableData,
      })
    }
  }

  const onDrop = (opt) => {
    const e = opt.e
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (files && files.length) {
      importImageFile(files[0])
    }
  }

  const addTable = ({ rows, cols, data }) => {
    const canvas = canvasRef.current
    const s = settingsRef.current
    const id = `table-${tableIdRef.current++}`
    const table = buildTable({
      rows,
      cols,
      data,
      fontFamily: s.fontFamily,
    })
    const center = sceneCenter()
    table.set({
      id,
      tableRows: rows,
      tableCols: cols,
      tableData: data,
      left: center.x,
      top: center.y,
    })
    canvas.add(table)
    canvas.setActiveObject(table)
    canvas.requestRenderAll()
    commitHistory()
  }

  const updateTable = (id, data) => {
    const canvas = canvasRef.current
    const target = canvas.getObjects().find((o) => o.id === id)
    if (!target) return
    const s = settingsRef.current
    const { left, top, tableRows, tableCols } = target
    const table = buildTable({
      rows: tableRows,
      cols: tableCols,
      data,
      fontFamily: s.fontFamily,
    })
    table.set({
      id,
      tableRows,
      tableCols,
      tableData: data,
      left,
      top,
    })
    canvas.remove(target)
    canvas.add(table)
    canvas.setActiveObject(table)
    canvas.requestRenderAll()
    commitHistory()
  }

  const addChart = ({ type, data }) => {
    const canvas = canvasRef.current
    if (!CHART_TYPES.includes(type)) return
    const s = settingsRef.current
    const chart = buildChart({ type, data, fontFamily: s.fontFamily })
    const center = sceneCenter()
    chart.set({ left: center.x, top: center.y })
    canvas.add(chart)
    canvas.setActiveObject(chart)
    canvas.requestRenderAll()
    commitHistory()
  }

  const importImageFile = (file) => {
    const url = URL.createObjectURL(file)
    importImage(url)
  }

  const importImage = (url) => {
    const canvas = canvasRef.current
    FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      .then((img) => {
        const maxDim = 480
        const scale = Math.min(
          1,
          maxDim / Math.max(img.width || 1, img.height || 1),
        )
        img.scale(scale)
        const center = sceneCenter()
        img.set({
          left: center.x - (img.width * scale) / 2,
          top: center.y - (img.height * scale) / 2,
        })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.requestRenderAll()
        commitHistory()
      })
      .catch((err) => {
        console.error('Failed to load image', err)
      })
  }

  const deleteSelected = () => {
    const canvas = canvasRef.current
    const active = canvas.getActiveObject()
    if (active && active.isEditing) active.exitEditing()
    const objects = canvas.getActiveObjects()
    if (!objects.length) return
    objects.forEach((o) => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    commitHistory()
  }

  const clearAll = () => {
    const canvas = canvasRef.current
    canvas.getObjects().forEach((o) => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    commitHistory()
  }

  const download = (url, name) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const exportImage = (format) => {
    const canvas = canvasRef.current
    if (format === 'png') {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2,
        enableRetinaScaling: false,
      })
      download(dataUrl, 'whiteboard.png')
    } else if (format === 'svg') {
      const svg = canvas.toSVG({ backgroundColor: '#ffffff' })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      download(URL.createObjectURL(blob), 'whiteboard.svg')
    } else if (format === 'json') {
      const json = JSON.stringify(canvas.toObject(HISTORY_PROPS), null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      download(URL.createObjectURL(blob), 'whiteboard.json')
    }
  }

  const importJSON = (text) => {
    const canvas = canvasRef.current
    canvas
      .loadFromJSON(text)
      .then(() => {
        canvas.requestRenderAll()
        commitHistory()
      })
      .catch((err) => {
        console.error('Failed to load JSON', err)
      })
  }

  const zoomBy = (factor) => {
    const canvas = canvasRef.current
    const current = canvas.getZoom()
    const next = clamp(current * factor, 0.05, 5)
    canvas.zoomToPoint(
      { x: canvas.getWidth() / 2, y: canvas.getHeight() / 2 },
      next,
    )
    canvas.requestRenderAll()
    onZoomChange?.(next)
  }

  const zoomToFit = () => {
    const canvas = canvasRef.current
    const objects = canvas.getObjects()
    if (!objects.length) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      canvas.requestRenderAll()
      onZoomChange?.(1)
      return
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    objects.forEach((o) => {
      const box = o.getBoundingRect()
      minX = Math.min(minX, box.left)
      minY = Math.min(minY, box.top)
      maxX = Math.max(maxX, box.left + box.width)
      maxY = Math.max(maxY, box.top + box.height)
    })
    const w = canvas.getWidth()
    const h = canvas.getHeight()
    const pad = 60
    const bw = Math.max(1, maxX - minX)
    const bh = Math.max(1, maxY - minY)
    const scale = clamp(
      Math.min((w - pad) / bw, (h - pad) / bh, 1.5),
      0.05,
      3,
    )
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    canvas.setViewportTransform([
      scale,
      0,
      0,
      scale,
      w / 2 - cx * scale,
      h / 2 - cy * scale,
    ])
    canvas.requestRenderAll()
    onZoomChange?.(scale)
  }

  // init canvas
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const canvasEl = document.createElement('canvas')
    container.appendChild(canvasEl)
    const canvas = new Canvas(canvasEl, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    })
    canvasRef.current = canvas
    canvas.freeDrawingBrush = new PencilBrush(canvas)

    const handlers = {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onPathCreated,
      onObjectModified,
      onTextExited,
      onDblClick,
      onDrop,
    }
    canvas.on('mouse:down', handlers.onMouseDown)
    canvas.on('mouse:move', handlers.onMouseMove)
    canvas.on('mouse:up', handlers.onMouseUp)
    canvas.on('path:created', handlers.onPathCreated)
    canvas.on('object:modified', handlers.onObjectModified)
    canvas.on('text:editing:exited', handlers.onTextExited)
    canvas.on('mouse:dblclick', handlers.onDblClick)
    canvas.on('drop', handlers.onDrop)

    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        const current = canvas.getZoom()
        const next = clamp(current * factor, 0.05, 5)
        canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, next)
        canvas.requestRenderAll()
        onZoomChange?.(next)
      }
    })

    const onResize = () => {
      const rect = container.getBoundingClientRect()
      canvas.setDimensions({ width: rect.width, height: rect.height })
    }
    window.addEventListener('resize', onResize)

    const observer = new ResizeObserver(onResize)
    observer.observe(container)

    applyToolState()
    commitHistory()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.dispose()
      // Fabric's dispose() leaves the original canvas element in the DOM
      // (the wrapper div is unwrapped back into the bare lower canvas). Remove
      // leftovers so a re-mount (e.g. React StrictMode in dev) doesn't end up
      // with a dead canvas stacked over the live one, swallowing pointer events.
      canvasEl.remove()
      canvasRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // react to tool / style changes
  useEffect(() => {
    applyToolState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.tool])

  const applySettingsToSelection = () => {
    const canvas = canvasRef.current
    const s = settingsRef.current
    const active = canvas.getActiveObject()
    if (!active) return
    const applyTo = (o) => {
      if (o.isTable || o.isChart) return
      if (o.type === 'rect' || o.type === 'ellipse') {
        o.set({
          fill: s.useFill ? s.fillColor : 'transparent',
          stroke: s.strokeColor,
          strokeWidth: s.strokeWidth,
        })
      } else if (o.type === 'polygon') {
        o.set({
          fill: s.useFill ? s.fillColor : 'transparent',
          stroke: s.strokeColor,
          strokeWidth: s.strokeWidth,
        })
      } else if (o.type === 'line' || o.type === 'path') {
        o.set({ stroke: s.strokeColor, strokeWidth: s.strokeWidth })
      } else if (o.type === 'i-text' || o.type === 'text') {
        o.set({
          fill: s.strokeColor,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
        })
      }
      o.setCoords?.()
    }
    if (active.type === 'activeSelection') {
      active.getObjects().forEach(applyTo)
    } else {
      applyTo(active)
    }
    canvas.requestRenderAll()
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    commitTimerRef.current = setTimeout(commitHistory, 400)
  }

  useEffect(() => {
    if (canvasRef.current?.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.color = settings.strokeColor
      canvasRef.current.freeDrawingBrush.width = Math.max(
        1,
        settings.strokeWidth * 2.5,
      )
    }
    applySettingsToSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.strokeColor,
    settings.fillColor,
    settings.useFill,
    settings.strokeWidth,
    settings.fontSize,
    settings.fontFamily,
  ])

  // keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      const mod = e.ctrlKey || e.metaKey
      const active = canvas.getActiveObject()
      if (active && active.isEditing) {
        if (e.key === 'Escape') {
          active.exitEditing()
          e.preventDefault()
        }
        return
      }
      const key = e.key.toLowerCase()
      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && key === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (mod && key === 's') {
        e.preventDefault()
        exportImage('png')
        return
      }
      if (mod && key === 'a') {
        e.preventDefault()
        const objects = canvas
          .getObjects()
          .filter((o) => o.selectable !== false)
        if (objects.length) {
          canvas.setActiveObject(new ActiveSelection(objects, { canvas }))
        }
        canvas.requestRenderAll()
        return
      }
      if (key === 'delete' || key === 'backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }
      if (key === 'escape') {
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        return
      }
      const toolMap = {
        v: 'select',
        h: 'pan',
        p: 'draw',
        r: 'rectangle',
        o: 'ellipse',
        d: 'diamond',
        l: 'line',
        a: 'arrow',
        t: 'text',
      }
      if (toolMap[key]) {
        onToolChange?.(toolMap[key])
      } else if (key === '=' || key === '+') {
        zoomBy(1.2)
      } else if (key === '-') {
        zoomBy(0.8)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    deleteSelected,
    clearAll,
    exportImage,
    importJSON,
    zoomIn: () => zoomBy(1.2),
    zoomOut: () => zoomBy(0.8),
    zoomToFit,
    resetZoom: () => {
      const canvas = canvasRef.current
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      canvas.requestRenderAll()
      onZoomChange?.(1)
    },
    getZoom: () => (canvasRef.current ? canvasRef.current.getZoom() : 1),
    addTable,
    updateTable,
    addChart,
    importImageFile,
  }))

  return <div className="whiteboard-canvas" ref={containerRef} />
})

export default Whiteboard
