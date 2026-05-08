import type { ReactNode, SVGProps } from 'react';

export type SiteIconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox'> & {
  size?: number;
  strokeWidth?: number;
};

function Svg({
  size = 24,
  strokeWidth = 2,
  className,
  children,
  ...rest
}: SiteIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconArrowLeft02(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

/** Same glyph as IconArrowLeft02; kept for call sites that used ArrowLeft01. */
export function IconArrowLeft01(props: SiteIconProps) {
  return <IconArrowLeft02 {...props} />;
}

export function IconArrowRight02(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function IconArrowDataTransferVertical(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
    </Svg>
  );
}

export function IconArrowDataTransferHorizontal(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h18M7 8 3 12l4 4M17 8l4 4-4 4" />
    </Svg>
  );
}

export function IconCpu(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M20 9h2M20 14h2M2 9h2M2 14h2" />
    </Svg>
  );
}

export function IconFlash(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

export function IconDelete02(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
    </Svg>
  );
}

export function IconFile01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M12 18v-6M9 15h6" />
    </Svg>
  );
}

export function IconShield01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function IconUpload04(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </Svg>
  );
}

export function IconBookOpen01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2zM22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
    </Svg>
  );
}

export function IconSparkles(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 1.2 3.2 3.6 1.2-3.6 1.2L12 12l-1.2-3.4-3.6-1.2 3.6-1.2L12 3z" />
      <path d="M5 15v1M5 18v1M3.5 16.5h1M6.5 16.5h1M19 8v1M19 11v1M17.5 9.5h1M20.5 9.5h1" />
    </Svg>
  );
}

export function IconCheckmarkCircle01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconAdd01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconArchive01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
    </Svg>
  );
}

export function IconDownload01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </Svg>
  );
}

export function IconRefresh(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Svg>
  );
}

export function IconMenu01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export function IconLogout01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}

export function IconMailSend01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  );
}

export function IconMail01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </Svg>
  );
}

export function IconLockPassword(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconSearch01(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function IconEye(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconLockKey(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M12 16v-2" />
    </Svg>
  );
}

export function IconTable(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
    </Svg>
  );
}

export function IconScanDoc(props: SiteIconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M9 8h8M9 12h8M9 16h5" />
      <path d="M3 7h2M3 12h2M3 17h2" />
    </Svg>
  );
}
