import { HubShell } from "@/components/HubShell";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HubShell>{children}</HubShell>;
}
