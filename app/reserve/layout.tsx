import "./reserve-theme.css";

export const metadata = { title: "BNI KOREA | 대관 예약" };

export default function ReserveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="rsv-page">{children}</div>;
}
