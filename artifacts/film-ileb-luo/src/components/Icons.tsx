type P = { size?: number; color?: string; className?: string };
const I = ({ d, size = 20, color = 'currentColor', vb = '0 0 24 24', className }: P & { d: string; vb?: string }) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{d.split('|').map((path, i) => <path key={i} d={path} />)}</svg>
);

export const DashboardIcon = (p: P) => <I {...p} d="M3 3h7v7H3z|M14 3h7v7h-7z|M14 14h7v7h-7z|M3 14h7v7H3z" />;
export const MovieIcon = (p: P) => <I {...p} d="M2 8h20M2 16h20M8 2v4M16 2v4M8 18v4M16 18v4M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />;
export const SeriesIcon = (p: P) => <I {...p} d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z|M8 21h8M12 17v4" />;
export const EpisodeIcon = (p: P) => <I {...p} d="M5 3l14 9-14 9V3z" />;
export const LiveIcon = (p: P) => <I {...p} d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6|M2 20h.01" />;
export const UsersIcon = (p: P) => <I {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
export const SubscriptionIcon = (p: P) => <I {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
export const WalletIcon = (p: P) => <I {...p} d="M20 12V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5|M16 12h6v4h-6z" />;
export const SettingsIcon = (p: P) => <I {...p} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />;
export const SEOIcon = (p: P) => <I {...p} d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.35-4.35" />;
export const BackIcon = (p: P) => <I {...p} d="M19 12H5|M12 19l-7-7 7-7" />;
export const LogoutIcon = (p: P) => <I {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9" />;
export const UserIcon = (p: P) => <I {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
export const CrownIcon = (p: P) => <I {...p} d="M2 19h20M3 9l4 5 5-8 5 8 4-5v10H3z" />;
export const DollarIcon = (p: P) => <I {...p} d="M12 1v22|M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
export const PlusIcon = (p: P) => <I {...p} d="M12 5v14|M5 12h14" />;
export const EditIcon = (p: P) => <I {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7|M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
export const TrashIcon = (p: P) => <I {...p} d="M3 6h18|M8 6V4h8v2|M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />;
export const UploadIcon = (p: P) => <I {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12" />;
export const CheckIcon = (p: P) => <I {...p} d="M20 6L9 17l-5-5" />;
export const AlertIcon = (p: P) => <I {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z|M12 9v4|M12 17h.01" />;
export const CloseIcon = (p: P) => <I {...p} d="M18 6L6 18|M6 6l12 12" />;
export const ChartIcon = (p: P) => <I {...p} d="M18 20V10|M12 20V4|M6 20v-6" />;
export const SignalIcon = (p: P) => <I {...p} d="M1 6c0 0 4-4 11-4s11 4 11 4|M5 10c0 0 3-3 7-3s7 3 7 3|M9 14c0 0 1-1 3-1s3 1 3 1|M12 18h.01" />;
export const ShieldIcon = (p: P) => <I {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
export const BellIcon = (p: P) => <I {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9|M13.73 21a2 2 0 0 1-3.46 0" />;
export const ArrowUpIcon = (p: P) => <I {...p} d="M12 19V5|M5 12l7-7 7 7" />;
export const FilterIcon = (p: P) => <I {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
export const CalendarIcon = (p: P) => <I {...p} d="M8 2v4M16 2v4M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />;
export const RefreshIcon = (p: P) => <I {...p} d="M23 4v6h-6|M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />;
export const LockIcon = (p: P) => <I {...p} d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z|M7 11V7a5 5 0 0 1 10 0v4" />;
export const EyeIcon = (p: P) => <I {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
export const HomeIcon = (p: P) => <I {...p} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10" />;
