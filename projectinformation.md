# ProjectFlow Whiteboard

A browser-based infinite whiteboard for taking notes and drawing — an Excalidraw-style
app with extra features: **tables**, **charts**, and **image insertion**.

## Core features

1. **Drawing tools** — freehand drawing, rectangle, ellipse, diamond, line, arrow,
   and click-to-type text. All shapes are drawn by dragging with the mouse (or
   touch/stylus) directly on the canvas.
2. **Styling** — change the **stroke color**, **fill color** (toggleable), **stroke
   width** (1–24), **font family** (Default / Handwriting / Monospace / Serif / Heavy)
   and **font size** (10–80). Styles apply to newly drawn objects and to the current
   selection.
3. **Tables** — insert a table by choosing the **number of rows and columns**, then
   fill in the cells. Double-click any placed table to edit its cell contents.
4. **Charts** — insert **bar**, **line**, or **pie** charts with editable labels,
   values, and per-series colors.
5. **Canvas & workflow** — select/move/resize objects with the mouse arrow tool,
   pan (H), zoom (Ctrl+scroll or toolbar, 5%–500%), grid toggle, undo/redo
   (Ctrl+Z / Ctrl+Shift+Z), delete, and clear.
6. **Export / import** — export to **PNG**, **SVG**, or **JSON**; import a saved
   JSON file back to continue editing. Images can also be dropped or inserted
   directly onto the board.
7. **Themes** — warm off-white canvas in light mode (easy on the eyes) with a
   **dark mode** toggle; both persisted in `localStorage`.

## Tech stack

- **React 19** (functional components + hooks) for the entire UI.
- **fabric.js 7** for canvas rendering, object model, and interaction.
- **Vite 8** for dev server and production builds.
- **oxlint** for linting.
- Vanilla CSS with CSS variables for theming (no UI framework).

## Project structure

```
src/
├── main.jsx                  # React entry point
├── App.jsx                   # App shell: toolbar + canvas + modals + state
├── App.css / index.css       # Styles & CSS variables (light/dark themes)
├── components/
│   ├── Whiteboard.jsx        # Fabric canvas: drawing, history, zoom, keyboard
│   ├── Toolbar.jsx           # Tool buttons, colors, sliders, zoom, export menu
│   ├── TableModal.jsx        # Insert/edit table (rows, cols, cell data)
│   └── ChartModal.jsx        # Insert chart (type + data editor)
└── lib/
    ├── shapes.js             # Shape/arrow/table/chart builders for fabric
    └── icons.jsx             # Inline SVG toolbar icons
```

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
npm run lint     # run oxlint
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `V` | Select tool |
| `H` | Pan tool |
| `P` | Freehand draw |
| `R` / `O` / `D` / `L` / `A` | Rectangle / Ellipse / Diamond / Line / Arrow |
| `T` | Text tool |
| `Ctrl+Z` / `Ctrl+Shift+Z` (or `Ctrl+Y`) | Undo / Redo |
| `Ctrl+S` | Export PNG |
| `Ctrl+A` | Select all objects |
| `Del` / `Backspace` | Delete selection |
| `+` / `-` | Zoom in / out |
| `Ctrl+scroll` | Zoom to cursor |
| `Esc` | Deselect / exit text editing |
