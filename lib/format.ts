export function won(n: number): string {
  return "₩" + Number(n || 0).toLocaleString("ko-KR");
}
