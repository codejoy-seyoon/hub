import { HubShell } from "@/components/HubShell";

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HubShell>{children}</HubShell>;
}
