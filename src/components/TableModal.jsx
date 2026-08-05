import { useEffect, useState } from 'react'

function initData(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, () => (r === 0 ? 'Header' : 'Cell')),
  )
}

export default function TableModal({ mode, meta, onConfirm, onCancel }) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [data, setData] = useState(() =>
    initData(mode === 'edit' ? meta?.rows || 3 : 3, mode === 'edit' ? meta?.cols || 3 : 3),
  )

  useEffect(() => {
    if (mode === 'edit' && meta) {
      setRows(meta.rows)
      setCols(meta.cols)
      setData(meta.data || initData(meta.rows, meta.cols))
    }
  }, [mode, meta])

  const changeRow = (r, c, value) => {
    setData((prev) => {
      const next = prev.map((row) => [...row])
      next[r][c] = value
      return next
    })
  }

  const setRC = (r, c) => {
    setRows(r)
    setCols(c)
    setData(initData(r, c))
  }

  return (
    <>
      <div className="overlay" onClick={onCancel} />
      <div className="modal table-modal" role="dialog" aria-modal="true">
        <h3>{mode === 'edit' ? 'Edit table' : 'Insert table'}</h3>

        {mode === 'create' && (
          <div className="form-row">
            <label>
              Rows
              <input
                type="number"
                name="table-rows"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRC(Number(e.target.value) || 1, cols)}
              />
            </label>
            <label>
              Columns
              <input
                type="number"
                name="table-cols"
                min="1"
                max="12"
                value={cols}
                onChange={(e) => setRC(rows, Number(e.target.value) || 1)}
              />
            </label>
          </div>
        )}

        <div className="table-editor">
          {Array.from({ length: rows }, (_, r) => (
            <div className="table-editor-row" key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <input
                  key={c}
                  className={r === 0 ? 'table-header-cell' : ''}
                  name={`cell-${r}-${c}`}
                  value={data?.[r]?.[c] ?? ''}
                  placeholder={`${r}-${c}`}
                  onChange={(e) => changeRow(r, c, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="btn-group">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm({ rows, cols, data })}
          >
            {mode === 'edit' ? 'Save' : 'Insert'}
          </button>
        </div>
      </div>
    </>
  )
}
