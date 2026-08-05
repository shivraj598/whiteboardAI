import { useState } from 'react'

const SAMPLE_DATA = [
  { label: 'Mon', value: 42, color: '#4c78a8' },
  { label: 'Tue', value: 58, color: '#f58518' },
  { label: 'Wed', value: 34, color: '#e45756' },
  { label: 'Thu', value: 72, color: '#72b7b2' },
  { label: 'Fri', value: 51, color: '#54a24b' },
]

const PALETTE = ['#4c78a8', '#f58518', '#e45756', '#72b7b2', '#54a24b', '#b279a2']

function ChartIcon({ type }) {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
      {type === 'bar' && (
        <>
          <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
          <rect x="10" y="7" width="4" height="13" rx="1" fill="currentColor" />
          <rect x="16" y="3" width="4" height="17" rx="1" fill="currentColor" />
        </>
      )}
      {type === 'line' && (
        <>
          <path
            d="M3 16l5-6 4 4 6-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="3" cy="16" r="2" fill="currentColor" />
          <circle cx="8" cy="10" r="2" fill="currentColor" />
          <circle cx="12" cy="14" r="2" fill="currentColor" />
          <circle cx="18" cy="5" r="2" fill="currentColor" />
        </>
      )}
      {type === 'pie' && (
        <>
          <path
            d="M12 3a9 9 0 0 1 8.6 6H12z"
            fill="currentColor"
          />
          <path
            d="M12 3v9l-7.8 4.5A9 9 0 0 1 12 3z"
            fill="currentColor"
            opacity="0.75"
          />
          <path
            d="M12 12l-7.8 4.5A9 9 0 0 0 12 21a9 9 0 0 0 8.6-6z"
            fill="currentColor"
            opacity="0.55"
          />
        </>
      )}
    </svg>
  )
}

export default function ChartModal({ onConfirm, onCancel }) {
  const [type, setType] = useState('bar')
  const [data, setData] = useState(SAMPLE_DATA)

  const update = (i, field, value) => {
    setData((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)))
  }

  const addRow = () => {
    setData((prev) => [
      ...prev,
      { label: `Item ${prev.length + 1}`, value: 0, color: PALETTE[prev.length % PALETTE.length] },
    ])
  }

  const removeRow = (i) => {
    setData((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <div className="overlay" onClick={onCancel} />
      <div className="modal chart-modal" role="dialog" aria-modal="true">
        <h3>Insert chart</h3>

        <div className="chart-type-grid">
          {['bar', 'line', 'pie'].map((t) => (
            <button
              type="button"
              key={t}
              className={`chart-type-btn${type === t ? ' active' : ''}`}
              onClick={() => setType(t)}
            >
              <ChartIcon type={t} />
              <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
        </div>

        <div className="chart-data">
          <div className="chart-data-head">
            <span>Label</span>
            <span>Value</span>
            <span>Color</span>
            <span />
          </div>
          {data.map((row, i) => (
            <div className="chart-data-row" key={i}>
              <input
                type="text"
                name={`chart-label-${i}`}
                value={row.label}
                placeholder="Label"
                onChange={(e) => update(i, 'label', e.target.value)}
              />
              <input
                type="number"
                name={`chart-value-${i}`}
                value={row.value}
                placeholder="0"
                onChange={(e) => update(i, 'value', e.target.value)}
              />
              <input
                type="color"
                name={`chart-color-${i}`}
                value={row.color}
                onChange={(e) => update(i, 'color', e.target.value)}
              />
              <button
                type="button"
                className="row-remove"
                title="Remove row"
                onClick={() => removeRow(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="btn-secondary add-row" onClick={addRow}>
          + Add data point
        </button>

        <div className="btn-group">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm({ type, data })}
          >
            Insert
          </button>
        </div>
      </div>
    </>
  )
}
