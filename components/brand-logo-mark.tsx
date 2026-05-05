/** Inline mark: zero extra image request; fixes Lighthouse oversize / next-gen format for nav. */
export function BrandLogoMark({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      width={40}
      height={40}
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="9" fill="#f1f5f9" />
      <path
        d="M11 9h12l7 7v15H11V9z"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="1.25"
      />
      <path d="M23 9v7h7" fill="none" stroke="#e2e8f0" strokeWidth="1.25" />
      <path
        d="M16.5 25.5 20 18l3.5 7.5M18 23h4"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
