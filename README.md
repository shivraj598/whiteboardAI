# ProjectFlow Whiteboard

A browser-based infinite whiteboard for notes and drawing — an Excalidraw-style clone
with extra features: editable **tables**, data-driven **charts** (bar / line / pie),
and **image insertion**.

**Features:** freehand + shapes (rectangle, ellipse, diamond, line, arrow), click-to-type
text, stroke & fill colors, stroke width, font family & size, light/dark themes, grid,
pan, zoom, undo/redo, delete/clear, PNG/SVG/JSON export, JSON import.

Built with **React 19** and **fabric.js 7**, bundled by **Vite 8**.

## Getting started

```bash
npm install
npm run dev       # dev server (HMR)
npm run build     # production build -> dist/
npm run preview   # preview production build
npm run lint      # run oxlint
```

Open the printed local URL, pick a tool from the toolbar and start drawing.

See `projectinformation.md` for the full feature list, project structure, and
keyboard shortcuts.