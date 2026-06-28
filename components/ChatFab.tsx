/* legacy 우하단 고정 챗 버튼 */
export function ChatFab() {
  return (
    <button
      aria-label="문의"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-red text-white shadow-xl transition hover:bg-red-dark"
    >
      <span className="material-symbols-outlined">chat_bubble</span>
    </button>
  );
}
