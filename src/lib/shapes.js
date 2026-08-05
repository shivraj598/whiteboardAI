import { Rect, Polygon, Path, IText, Text, Group, Line, Circle } from 'fabric'

export const FONT_OPTIONS = [
  { label: 'Default', value: 'sans-serif' },
  { label: 'Handwriting', value: '"Comic Sans MS", "Segoe Print", sans-serif' },
  { label: 'Monospace', value: '"Courier New", monospace' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Heavy', value: 'Impact, "Arial Black", sans-serif' },
]

export function createArrowPath(x1, y1, x2, y2, headLength = 16) {
  const dx = x2 - x1
  const dy = y2 - y1
  const angle = Math.atan2(dy, dx)
  const spread = Math.PI / 7
  const a1 = angle + Math.PI - spread
  const a2 = angle + Math.PI + spread
  const hx1 = x2 + headLength * Math.cos(a1)
  const hy1 = y2 + headLength * Math.sin(a1)
  const hx2 = x2 + headLength * Math.cos(a2)
  const hy2 = y2 + headLength * Math.sin(a2)
  return `M ${x1} ${y1} L ${x2} ${y2} M ${x2} ${y2} L ${hx1} ${hy1} M ${x2} ${y2} L ${hx2} ${hy2}`
}

export function makeArrow(x1, y1, x2, y2, { stroke, strokeWidth }) {
  return new Path(createArrowPath(x1, y1, x2, y2), {
    fill: '',
    stroke,
    strokeWidth,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    objectCaching: false,
  })
}

export function makeDiamond(x, y, w, h, { fill, stroke, strokeWidth }) {
  const points = [
    { x: x + w / 2, y },
    { x: x + w, y: y + h / 2 },
    { x: x + w / 2, y: y + h },
    { x, y: y + h / 2 },
  ]
  return new Polygon(points, {
    fill,
    stroke,
    strokeWidth,
    strokeLineJoin: 'round',
    objectCaching: false,
  })
}

export function makeText(str, x, y, { fill, fontSize, fontFamily }) {
  return new IText(str, {
    left: x,
    top: y,
    fill,
    fontSize,
    fontFamily,
    editable: true,
    padding: 8,
  })
}

export function buildTable({ rows, cols, data, cellW = 130, cellH = 40, fontFamily = 'sans-serif' }) {
  const objects = []
  const headerH = 44
  const pad = 8
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW
      const y = r * (cellH + 1)
      const isHeader = r === 0
      const rect = new Rect({
        left: x,
        top: y,
        width: cellW,
        height: isHeader ? headerH : cellH,
        fill: isHeader ? 'rgba(120,120,120,0.12)' : 'rgba(255,255,255,0.9)',
        stroke: 'rgba(0,0,0,0.25)',
        strokeWidth: 1,
        originX: 'left',
        originY: 'top',
      })
      const value = data?.[r]?.[c] ?? ''
      const label = new Text(value, {
        left: x + pad,
        top: y + (isHeader ? headerH : cellH) / 2,
        fontSize: isHeader ? 15 : 13,
        fontFamily,
        fontWeight: isHeader ? 'bold' : 'normal',
        fill: '#1a1a1a',
        originX: 'left',
        originY: 'center',
        textAlign: 'left',
      })
      objects.push(rect, label)
    }
  }
  return new Group(objects, {
    isTable: true,
    subTargetCheck: false,
    padding: 0,
  })
}

function pieSlice(cx, cy, r, start, end, color) {
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const large = end - start > Math.PI ? 1 : 0
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
  return new Path(d, {
    fill: color,
    stroke: 'rgba(255,255,255,0.9)',
    strokeWidth: 1.5,
    originX: 'left',
    originY: 'top',
    objectCaching: false,
  })
}

function truncated(str, max = 12) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

export function buildChart({ type, data, width = 520, height = 340, fontFamily = 'sans-serif' }) {
  const objects = []
  const chartH = height - 60
  const chartW = width - 90
  const left = 60
  const top = 16
  const fontSize = 13

  const title = new Text('', { visible: false })

  if (type === 'bar') {
    const values = data.map((d) => Number(d.value) || 0)
    const max = Math.max(1, ...values)
    const n = data.length
    const gap = 10
    const barW = Math.min(70, (chartW - gap * (n - 1)) / Math.max(1, n))
    const maxH = chartH - 34
    data.forEach((d, i) => {
      const h = Math.max(4, (Number(d.value) / max) * maxH)
      const x = left + i * (barW + gap)
      const y = top + chartH - h - 24
      const bar = new Rect({
        left: x,
        top: y,
        width: barW,
        height: h,
        fill: d.color || '#4c78a8',
        rx: 3,
        ry: 3,
        originX: 'left',
        originY: 'top',
      })
      const val = new Text(String(d.value), {
        left: x + barW / 2,
        top: y - 4,
        originX: 'center',
        originY: 'bottom',
        fontSize: 13,
        fontFamily,
        fill: '#555',
      })
      const lbl = new Text(truncated(d.label || ''), {
        left: x + barW / 2,
        top: top + chartH - 10,
        originX: 'center',
        originY: 'bottom',
        fontSize,
        fontFamily,
        fill: '#666',
      })
      objects.push(bar, val, lbl)
    })
    objects.push(
      new Line([left, top + chartH - 22, left + chartW, top + chartH - 22], {
        stroke: '#999',
        strokeWidth: 1,
      }),
    )
  } else if (type === 'line') {
    const values = data.map((d) => Number(d.value) || 0)
    const max = Math.max(1, ...values)
    const n = data.length
    const stepX = n > 1 ? chartW / (n - 1) : 0
    const points = values.map((v, i) => ({
      x: left + i * stepX,
      y: top + chartH - 24 - (v / max) * (chartH - 48),
    }))
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')
    objects.push(
      new Path(path, {
        fill: '',
        stroke: '#4c78a8',
        strokeWidth: 3,
        strokeLineJoin: 'round',
        strokeLineCap: 'round',
      }),
    )
    points.forEach((p, i) => {
      objects.push(
        new Circle({
          left: p.x - 5,
          top: p.y - 5,
          radius: 5,
          fill: '#fff',
          stroke: '#4c78a8',
          strokeWidth: 2.5,
          originX: 'left',
          originY: 'top',
        }),
      )
      objects.push(
        new Text(truncated(data[i].label || ''), {
          left: p.x,
          top: top + chartH - 12,
          originX: 'center',
          originY: 'bottom',
          fontSize,
          fontFamily,
          fill: '#666',
        }),
      )
    })
  } else if (type === 'pie') {
    const values = data.map((d) => Number(d.value) || 0)
    const total = values.reduce((a, b) => a + b, 0) || 1
    const r = Math.min(height / 2 - 30, 130)
    const cx = left + 80
    const cy = top + chartH / 2
    let angle = -Math.PI / 2
    data.forEach((d, i) => {
      const sweep = (values[i] / total) * Math.PI * 2
      objects.push(pieSlice(cx, cy, r, angle, angle + sweep, d.color || '#4c78a8'))
      angle += sweep
    })
    const legendX = cx + r + 40
    data.forEach((d, i) => {
      const ly = cy - r + i * 30
      objects.push(
        new Rect({
          left: legendX,
          top: ly - 6,
          width: 14,
          height: 14,
          fill: d.color || '#4c78a8',
          rx: 2,
          ry: 2,
          originX: 'left',
          originY: 'top',
        }),
      )
      objects.push(
        new Text(`${d.label || ''}  ${d.value}`, {
          left: legendX + 20,
          top: ly,
          originX: 'left',
          originY: 'center',
          fontSize,
          fontFamily,
          fill: '#666',
        }),
      )
    })
  }

  objects.push(title)
  return new Group(objects, {
    isChart: true,
    chartType: type,
    chartData: data,
    subTargetCheck: false,
    padding: 0,
  })
}
