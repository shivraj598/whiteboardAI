function Svg({ children, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconSelect = (p) => (
  <Svg {...p}>
    <path d="M4 3l7 18 2.2-7.8L21 11z" />
  </Svg>
)

export const IconPan = (p) => (
  <Svg {...p}>
    <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10" />
    <path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V10" />
    <path d="M14 10V6a1.5 1.5 0 0 1 3 0v5.5" />
    <path d="M17 11.5V9a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6.5 7H12c-2.5 0-4-1-5.5-2.5L3 16.5c-.7-.7-.6-1.8.2-2.4.9-.7 2.1-.5 2.8.4L8 17" />
  </Svg>
)

export const IconDraw = (p) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Svg>
)

export const IconRect = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
  </Svg>
)

export const IconEllipse = (p) => (
  <Svg {...p}>
    <ellipse cx="12" cy="12" rx="9" ry="6.5" />
  </Svg>
)

export const IconDiamond = (p) => (
  <Svg {...p}>
    <path d="M12 3l8 9-8 9-8-9z" />
  </Svg>
)

export const IconLine = (p) => (
  <Svg {...p}>
    <path d="M5 19L19 5" />
  </Svg>
)

export const IconArrow = (p) => (
  <Svg {...p}>
    <path d="M4 20L20 4" />
    <path d="M20 4h-6.5M20 4v6.5" />
  </Svg>
)

export const IconText = (p) => (
  <Svg {...p}>
    <path d="M5 6V4h14v2" />
    <path d="M12 4v16" />
    <path d="M9 20h6" />
  </Svg>
)

export const IconTable = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
    <path d="M12 9.5v10" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
)

export const IconImage = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="1" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="M3.5 17l5-5 4 4 3-3 5 4.5" />
  </Svg>
)

export const IconUndo = (p) => (
  <Svg {...p}>
    <path d="M9 7L4 12l5 5" />
    <path d="M4 12h10a6 6 0 0 1 6 6" />
  </Svg>
)

export const IconRedo = (p) => (
  <Svg {...p}>
    <path d="M15 7l5 5-5 5" />
    <path d="M20 12H10a6 6 0 0 0-6 6" />
  </Svg>
)

export const IconDelete = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </Svg>
)

export const IconClear = (p) => (
  <Svg {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 10v6M14 10v6" />
  </Svg>
)

export const IconZoomIn = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35M8 11h6M11 8v6" />
  </Svg>
)

export const IconZoomOut = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35M8 11h6" />
  </Svg>
)

export const IconFit = (p) => (
  <Svg {...p}>
    <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
  </Svg>
)

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 4v11" />
    <path d="M7 11l5 5 5-5" />
    <path d="M4 19h16" />
  </Svg>
)

export const IconMoon = (p) => (
  <Svg {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Svg>
)

export const IconSun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </Svg>
)

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
    <path d="M3.5 12h17M12 3.5v17" />
  </Svg>
)

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
)
