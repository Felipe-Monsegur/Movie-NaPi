/** Iconos de línea minimalistas (stroke, currentColor). */

type IconProps = {
  className?: string;
  size?: number;
};

function baseProps({ className, size = 20 }: IconProps) {
  return {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  };
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Marca / película */
export function IconFilm(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="2" y="4" width="20" height="16" rx="2" {...stroke} />
      <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" {...stroke} />
    </svg>
  );
}

/** Lista Por ver */
export function IconList(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8 6h13M8 12h13M8 18h13" {...stroke} />
      <path d="M3 6h.01M3 12h.01M3 18h.01" {...stroke} />
    </svg>
  );
}

/** Puntuar */
export function IconStar(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3z"
        {...stroke}
      />
    </svg>
  );
}

/** Panel / chart */
export function IconChart(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 19V5M4 19h16" {...stroke} />
      <path d="M8 17V11M12 17V7M16 17v-4" {...stroke} />
    </svg>
  );
}

/** Lista de vistas (catálogo) */
export function IconCatalog(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2" {...stroke} />
      <path d="M7 8h10M7 12h10M7 16h6" {...stroke} />
    </svg>
  );
}

/** Buscar */
export function IconSearch(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="11" r="7" {...stroke} />
      <path d="M20 20l-3.5-3.5" {...stroke} />
    </svg>
  );
}

/** Acceso denegado */
export function IconBan(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M6.5 6.5l11 11" {...stroke} />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12l5 5L20 7" {...stroke} />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 6l12 12M18 6L6 18" {...stroke} />
    </svg>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M12 11v5M12 8h.01" {...stroke} />
    </svg>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3l10 18H2L12 3z" {...stroke} />
      <path d="M12 10v4M12 17h.01" {...stroke} />
    </svg>
  );
}

export { IconEditOutline, IconTrashOutline } from './PanelActionIcons';
