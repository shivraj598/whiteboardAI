import { useEffect, useRef, useState } from 'react'
import {
  IconSelect,
  IconPan,
  IconDraw,
  IconRect,
  IconEllipse,
  IconDiamond,
  IconLine,
  IconArrow,
  IconText,
  IconTable,
  IconChart,
  IconImage,
  IconUndo,
  IconRedo,
  IconDelete,
  IconClear,
  IconZoomIn,
  IconZoomOut,
  IconFit,
  IconDownload,
  IconMoon,
  IconSun,
  IconGrid,
} from '../lib/icons'
import { FONT_OPTIONS } from '../lib/shapes'

function ToolButton({ title, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className={`toolbar-btn${active ? ' active' : ''}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ColorField({ label, value, onChange, title }) {
  return (
    <label className="color-field" title={title || label}>
      <span className="color-swatch" style={{ background: value }}>
        <input
          type="color"
          name={`color-${label.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
      <span className="color-label">{label}</span>
    </label>
  )
}

export default function Toolbar({
  settings,
  theme,
  onToggleTheme,
  onToolChange,
  onStrokeColor,
  onFillColor,
  onToggleFill,
  onStrokeWidth,
  onFontSize,
  onFontFamily,
  onToggleGrid,
  history,
  onUndo,
  onRedo,
  onDelete,
  onClear,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onResetZoom,
  onExport,
  onImportJSON,
  onImageUpload,
  onOpenTable,
  onOpenChart,
  tableActive = false,
  chartActive = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const fileRef = useRef(null)
  const jsonRef = useRef(null)

  const tool = settings.tool

  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const tools = [
    { id: 'select', icon: IconSelect, title: 'Select (V)' },
    { id: 'pan', icon: IconPan, title: 'Pan (H)' },
    { id: 'draw', icon: IconDraw, title: 'Freehand (P)' },
    { id: 'rectangle', icon: IconRect, title: 'Rectangle (R)' },
    { id: 'ellipse', icon: IconEllipse, title: 'Ellipse (O)' },
    { id: 'diamond', icon: IconDiamond, title: 'Diamond (D)' },
    { id: 'line', icon: IconLine, title: 'Line (L)' },
    { id: 'arrow', icon: IconArrow, title: 'Arrow (A)' },
    { id: 'text', icon: IconText, title: 'Text (T)' },
  ]

  return (
    <div className="toolbar">
      <div className="toolbar-group tools-group">
        {tools.map((t) => {
          const Icon = t.icon
          return (
            <ToolButton
              key={t.id}
              title={t.title}
              active={tool === t.id}
              onClick={() => onToolChange(t.id)}
            >
              <Icon />
            </ToolButton>
          )
        })}
        <ToolButton
          title="Table"
          active={tableActive}
          onClick={onOpenTable}
        >
          <IconTable />
        </ToolButton>
        <ToolButton
          title="Chart"
          active={chartActive}
          onClick={onOpenChart}
        >
          <IconChart />
        </ToolButton>
        <ToolButton
          title="Insert image"
          onClick={() => fileRef.current?.click()}
        >
          <IconImage />
        </ToolButton>
      </div>

      <div className="toolbar-group styles-group">
        <ColorField
          label="Stroke"
          value={settings.strokeColor}
          onChange={onStrokeColor}
          title="Stroke color"
        />
        <ColorField
          label="Fill"
          value={settings.fillColor}
          onChange={onFillColor}
          title="Fill color"
        />
        <button
          type="button"
          className={`toolbar-btn${settings.useFill ? ' active' : ''}`}
          title="Toggle fill (fills shapes with the fill color)"
          onClick={onToggleFill}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 13.5h13M4 18.5h13M10 8.5c0-2 3-3 3-5 0 2 3 3 3 5a3 3 0 1 1-6 0z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <label className="size-slider-wrap" title="Stroke width">
          <span className="slider-label">Size</span>
          <input
            type="range"
            className="size-slider"
            name="stroke-width"
            min="1"
            max="24"
            value={settings.strokeWidth}
            onChange={(e) => onStrokeWidth(Number(e.target.value))}
          />
          <span className="slider-value">{settings.strokeWidth}</span>
        </label>
        <select
          className="font-select"
          name="font-family"
          title="Font family"
          value={settings.fontFamily}
          onChange={(e) => onFontFamily(e.target.value)}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <label className="size-slider-wrap" title="Font size">
          <span className="slider-label">Font</span>
          <input
            type="range"
            className="size-slider"
            name="font-size"
            min="10"
            max="80"
            value={settings.fontSize}
            onChange={(e) => onFontSize(Number(e.target.value))}
          />
          <span className="slider-value">{settings.fontSize}</span>
        </label>
      </div>

      <div className="toolbar-group">
        <ToolButton title="Undo (Ctrl+Z)" disabled={!history.canUndo} onClick={onUndo}>
          <IconUndo />
        </ToolButton>
        <ToolButton title="Redo (Ctrl+Shift+Z)" disabled={!history.canRedo} onClick={onRedo}>
          <IconRedo />
        </ToolButton>
        <ToolButton title="Delete selection (Del)" onClick={onDelete}>
          <IconDelete />
        </ToolButton>
        <ToolButton title="Clear canvas" onClick={onClear}>
          <IconClear />
        </ToolButton>
      </div>

      <div className="toolbar-group">
        <ToolButton title="Zoom out (−)" onClick={onZoomOut}>
          <IconZoomOut />
        </ToolButton>
        <button
          type="button"
          className="zoom-indicator"
          title="Reset zoom to 100%"
          onClick={onResetZoom}
        >
          {Math.round(zoom * 100)}%
        </button>
        <ToolButton title="Zoom in (+)" onClick={onZoomIn}>
          <IconZoomIn />
        </ToolButton>
        <ToolButton title="Zoom to fit" onClick={onZoomFit}>
          <IconFit />
        </ToolButton>
      </div>

      <div className="toolbar-group">
        <div className="menu">
          <button
            type="button"
            className="menu-btn"
            title="Export"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((o) => !o)
            }}
          >
            <IconDownload />
            <span>Export</span>
          </button>
          {menuOpen && (
            <div className="menu-items" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => onExport('png')}>
                Export PNG
              </button>
              <button type="button" onClick={() => onExport('svg')}>
                Export SVG
              </button>
              <button type="button" onClick={() => onExport('json')}>
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  jsonRef.current?.click()
                }}
              >
                Import JSON
              </button>
            </div>
          )}
        </div>
        <ToolButton
          title={settings.grid ? 'Hide grid' : 'Show grid'}
          active={settings.grid}
          onClick={onToggleGrid}
        >
          <IconGrid />
        </ToolButton>
        <ToolButton
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </ToolButton>
      </div>

      <input
        ref={fileRef}
        type="file"
        name="image-file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImageUpload(file)
          e.target.value = ''
        }}
      />
      <input
        ref={jsonRef}
        type="file"
        name="json-file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => onImportJSON(String(reader.result))
            reader.readAsText(file)
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}
