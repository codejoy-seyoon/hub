/* training 하위는 페이지마다 셸이 다르다:
   - home / [id] / checkout → 빨간 HubShell
   - schedule → 캘린더 셸 / news → 뉴스 셸 (각 페이지가 자체 적용)
   따라서 이 레이아웃은 통과만 한다. */
export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
