import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function svgProps({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
    ...props,
  };
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.3-3.3" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z" />
    </svg>
  );
}

export function ToothIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 3.2c-1.9 0-2.7-.9-4.3-.9C5.4 2.3 4 4 4 6.4c0 2 .6 3.4 1.1 5.1.4 1.4.5 3 .8 5 .2 1.6.7 4.5 2 4.5 1.4 0 1.3-3.3 2.1-5.5.3-.8.9-.8 1.2 0 .8 2.2.7 5.5 2.1 5.5 1.3 0 1.8-2.9 2-4.5.3-2 .4-3.6.8-5 .5-1.7 1.1-3.1 1.1-5.1 0-2.4-1.4-4.1-3.7-4.1-1.6 0-2.4.9-4.3.9Z" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 10h4M9 14h6" />
    </svg>
  );
}

export function OdontogramIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 7.2c-1 0-1.4-.5-2.3-.5-.9 0-1.6.9-1.6 2.2 0 1.6.6 2.5 1 4.4.2 1 .4 3.7 1.3 3.7.8 0 .7-2.4 1.2-3.8.2-.5.6-.5.8 0 .5 1.4.4 3.8 1.2 3.8.9 0 1.1-2.7 1.3-3.7.4-1.9 1-2.8 1-4.4 0-1.3-.7-2.2-1.6-2.2-.9 0-1.3.5-2.3.5Z" />
      <path d="M3 8V4.5A1.5 1.5 0 0 1 4.5 3H8" opacity="0.55" />
      <path d="M16 3h3.5A1.5 1.5 0 0 1 21 4.5V8" opacity="0.55" />
      <path d="M3 16v3.5A1.5 1.5 0 0 0 4.5 21H8" opacity="0.55" />
      <path d="M16 21h3.5a1.5 1.5 0 0 0 1.5-1.5V16" opacity="0.55" />
    </svg>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export function PulseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 11.6a8.5 8.5 0 0 1-12.6 7.5L3 21l1.9-5.2A8.5 8.5 0 1 1 21 11.6Z" />
      <path d="M8.6 8.4c.3-.5.9-.5 1.2 0l.7 1.2c.2.4.1.8-.2 1l-.5.4c.4 1 1.2 1.8 2.2 2.2l.4-.5c.2-.3.6-.4 1-.2l1.2.7c.5.3.5.9 0 1.2-.6.5-1.4.8-2.2.6-2-.4-3.6-2-4-4-.2-.8.1-1.6.6-2.2Z" opacity="0.7" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h9M17 17h3" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.3" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.3" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ServerIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <path d="M7 6.5h.01M7 17.5h.01" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
      <path d="m9 11.5 2 2 4-4" />
    </svg>
  );
}
