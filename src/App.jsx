import { useCallback, useEffect, useRef, useState } from 'react'
import Whiteboard from './components/Whiteboard'
import Toolbar from './components/Toolbar'
import TableModal from './components/TableModal'
import ChartModal from './components/ChartModal'
import './App.css'

const DEFAULT_SETTINGS = {
  tool: 'select',
  strokeColor: '#1e1e1e',
  fillColor: '#fef08a',
  useFill: true,
  strokeWidth: 3,
  fontSize: 26,
  fontFamily: 'sans-serif',
  grid: true,
}

function loadState() {
  try {
    const theme = localStorage.getItem('whiteboard-theme') || 'light'
    const settings = JSON.parse(
      localStorage.getItem('whiteboard-settings') || 'null',
    )
    return {
      theme,
      settings: { ...DEFAULT_SETTINGS, ...(settings || {}) },
    }
  } catch {
    return { theme: 'light', settings: DEFAULT_SETTINGS }
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const { theme, settings } = state
  const [history, setHistory] = useState({ canUndo: false, canRedo: false })
  const [zoom, setZoom] = useState(1)
  const [tableModal, setTableModal] = useState(null)
  const [chartModalOpen, setChartModalOpen] = useState(false)
  const whiteboardRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('whiteboard-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('whiteboard-settings', JSON.stringify(settings))
  }, [settings])

  const patchSettings = useCallback((patch) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  const onToolChange = useCallback(
    (tool) => patchSettings({ tool }),
    [patchSettings],
  )

  const handleTableConfirm = useCallback(
    ({ rows, cols, data }) => {
      if (tableModal?.mode === 'edit') {
        whiteboardRef.current?.updateTable(tableModal.meta.id, data)
      } else {
        whiteboardRef.current?.addTable({ rows, cols, data })
      }
      setTableModal(null)
    },
    [tableModal],
  )

  const handleChartConfirm = useCallback(
    ({ type, data }) => {
      whiteboardRef.current?.addChart({ type, data })
      setChartModalOpen(false)
    },
    [],
  )

  const handleEditTable = useCallback((meta) => {
    setTableModal({ mode: 'edit', meta })
  }, [])

  return (
    <div className="app">
      <Toolbar
        settings={settings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToolChange={onToolChange}
        onStrokeColor={(c) => patchSettings({ strokeColor: c })}
        onFillColor={(c) => patchSettings({ fillColor: c })}
        onToggleFill={() => patchSettings({ useFill: !settings.useFill })}
        onStrokeWidth={(v) => patchSettings({ strokeWidth: v })}
        onFontSize={(v) => patchSettings({ fontSize: v })}
        onFontFamily={(f) => patchSettings({ fontFamily: f })}
        onToggleGrid={() => patchSettings({ grid: !settings.grid })}
        history={history}
        onUndo={() => whiteboardRef.current?.undo()}
        onRedo={() => whiteboardRef.current?.redo()}
        onDelete={() => whiteboardRef.current?.deleteSelected()}
        onClear={() => whiteboardRef.current?.clearAll()}
        zoom={zoom}
        onZoomIn={() => whiteboardRef.current?.zoomIn()}
        onZoomOut={() => whiteboardRef.current?.zoomOut()}
        onZoomFit={() => whiteboardRef.current?.zoomToFit()}
        onResetZoom={() => whiteboardRef.current?.resetZoom()}
        onExport={(format) => whiteboardRef.current?.exportImage(format)}
        onImportJSON={(text) => whiteboardRef.current?.importJSON(text)}
        onImageUpload={(file) => whiteboardRef.current?.importImageFile(file)}
        onOpenTable={() => setTableModal({ mode: 'create' })}
        onOpenChart={() => setChartModalOpen(true)}
        tableActive={tableModal !== null}
        chartActive={chartModalOpen}
      />

      <main
        className={`canvas-container${settings.grid ? ' grid' : ''}`}
      >
        <Whiteboard
          ref={whiteboardRef}
          settings={settings}
          onHistoryChange={setHistory}
          onEditTable={handleEditTable}
          onToolChange={onToolChange}
          onZoomChange={setZoom}
        />
      </main>

      <footer className="statusbar">
        <span>
          Tools: <b>V</b> select · <b>P</b> draw · <b>R/O/D/L/A</b> shapes ·{' '}
          <b>T</b> text
        </span>
        <span>
          <b>Ctrl+Z</b> undo · <b>Ctrl+Shift+Z</b> redo · <b>Ctrl+S</b> export ·{' '}
          <b>Ctrl+scroll</b> zoom · double-click a table to edit its cells
        </span>
      </footer>

      {tableModal && (
        <TableModal
          mode={tableModal.mode}
          meta={tableModal.meta}
          onConfirm={handleTableConfirm}
          onCancel={() => setTableModal(null)}
        />
      )}

      {chartModalOpen && (
        <ChartModal
          onConfirm={handleChartConfirm}
          onCancel={() => setChartModalOpen(false)}
        />
      )}
    </div>
  )
}

export default App
