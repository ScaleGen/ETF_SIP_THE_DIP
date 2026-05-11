import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) { return <IconBase {...props}><path d="m3 10 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></IconBase>; }
export function DashboardIcon(props: IconProps) { return <IconBase {...props}><path d="M4 13h7V4H4z" /><path d="M13 20h7V4h-7z" /><path d="M4 20h7v-5H4z" /></IconBase>; }
export function ListIcon(props: IconProps) { return <IconBase {...props}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></IconBase>; }
export function BellIcon(props: IconProps) { return <IconBase {...props}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></IconBase>; }
export function ChartIcon(props: IconProps) { return <IconBase {...props}><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 3 5-7" /></IconBase>; }
export function SettingsIcon(props: IconProps) { return <IconBase {...props}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19 12a7 7 0 0 0-.08-1l2.02-1.57-2-3.46-2.39.96a7.6 7.6 0 0 0-1.73-1L14.5 3h-5l-.32 2.93a7.6 7.6 0 0 0-1.73 1l-2.39-.96-2 3.46L5.08 11a7 7 0 0 0 0 2l-2.02 1.57 2 3.46 2.39-.96a7.6 7.6 0 0 0 1.73 1L9.5 21h5l.32-2.93a7.6 7.6 0 0 0 1.73-1l2.39.96 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" /></IconBase>; }
export function ShieldIcon(props: IconProps) { return <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></IconBase>; }
export function TuneIcon(props: IconProps) { return <IconBase {...props}><path d="M4 7h10" /><path d="M18 7h2" /><path d="M16 5v4" /><path d="M4 17h2" /><path d="M10 17h10" /><path d="M8 15v4" /><path d="M4 12h5" /><path d="M13 12h7" /><path d="M11 10v4" /></IconBase>; }
export function ArrowRightIcon(props: IconProps) { return <IconBase {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>; }
export function PlusIcon(props: IconProps) { return <IconBase {...props}><path d="M12 5v14" /><path d="M5 12h14" /></IconBase>; }
export function DollarIcon(props: IconProps) { return <IconBase {...props}><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></IconBase>; }
export function PieIcon(props: IconProps) { return <IconBase {...props}><path d="M21 12a9 9 0 1 1-9-9v9z" /><path d="M12 3a9 9 0 0 1 9 9h-9z" /></IconBase>; }
export function MailIcon(props: IconProps) { return <IconBase {...props}><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></IconBase>; }
export function MoonIcon(props: IconProps) { return <IconBase {...props}><path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" /></IconBase>; }
export function CalculatorIcon(props: IconProps) { return <IconBase {...props}><path d="M6 3h12v18H6z" /><path d="M9 7h6" /><path d="M9 11h.01" /><path d="M12 11h.01" /><path d="M15 11h.01" /><path d="M9 15h.01" /><path d="M12 15h.01" /><path d="M15 15h.01" /></IconBase>; }
export function ClockIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>; }
export function WarningIcon(props: IconProps) { return <IconBase {...props}><path d="m12 3 10 18H2z" /><path d="M12 9v4" /><path d="M12 17h.01" /></IconBase>; }
export function UserIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></IconBase>; }
export function LockIcon(props: IconProps) { return <IconBase {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></IconBase>; }
