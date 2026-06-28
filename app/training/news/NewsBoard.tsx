"use client";

import { useEffect, useState } from "react";

type Comment = { author: string; role: string; date: string; text: string };
type Post = {
  id: number;
  cat: string;
  title: string;
  author: string;
  role: string;
  date: string;
  pinned: boolean;
  views: number;
  likes: number;
  secret: boolean;
  body: string;
  comments: Comment[];
};

const KEY = "bni_news_v1";
const CATS: [string, string][] = [
  ["all", "전체"],
  ["공지", "공지"],
  ["이벤트", "이벤트"],
  ["자유", "자유게시판"],
  ["Q&A", "Q&A"],
];
const catLabel: Record<string, string> = { 공지: "공지", 이벤트: "이벤트", 자유: "자유게시판", "Q&A": "Q&A" };
const catCls: Record<string, string> = {
  공지: "bg-red text-white",
  이벤트: "bg-amber-100 text-amber-700",
  자유: "bg-blue-100 text-blue-700",
  "Q&A": "bg-violet-100 text-violet-700",
};
const avColor: Record<string, string> = { admin: "#cf2030", user: "#5b6168" };

function seed(): Post[] {
  return [
    { id: 1, cat: "공지", title: "비지터 초대 노하우 전격 공개!!", author: "내셔널 오피스", role: "admin", date: "2026-06-19", pinned: true, views: 342, likes: 18, secret: false,
      body: "비지터 초대 성공률을 높이는 5가지 핵심 노하우를 정리했습니다. 첫째, 명확한 가치 제안. 둘째, 일정 사전 공유. 셋째, 후속 리마인드. 자세한 내용은 첨부 가이드를 참고해 주세요.",
      comments: [
        { author: "김멤버", role: "user", date: "2026-06-19", text: "좋은 정보 감사합니다! 바로 적용해볼게요." },
        { author: "내셔널 오피스", role: "admin", date: "2026-06-19", text: "도움이 되었다니 기쁩니다. 추가 질문은 언제든 댓글로 남겨주세요 :)" },
      ] },
    { id: 2, cat: "이벤트", title: "2026 내셔널 컨퍼런스 기간 한정 비지터 특별 혜택!", author: "내셔널 오피스", role: "admin", date: "2026-06-10", pinned: true, views: 521, likes: 33, secret: false,
      body: "2026 내셔널 컨퍼런스 기간 동안 비지터로 참여하시는 분들께 특별 등록 혜택을 제공합니다. 선착순 마감되니 서둘러 신청해 주세요.", comments: [] },
    { id: 3, cat: "공지", title: "2026년 6월 트레이닝 마감 일정 안내", author: "내셔널 오피스", role: "admin", date: "2026-06-05", pinned: false, views: 289, likes: 7, secret: false,
      body: "6월 트레이닝 신청 마감 일정을 안내드립니다. 각 챕터별 마감일이 상이하니 Schedule 페이지에서 확인 후 신청해 주세요.",
      comments: [{ author: "박디렉터", role: "user", date: "2026-06-05", text: "마감일 확인했습니다. 공유 감사합니다." }] },
    { id: 4, cat: "공지", title: "내셔널 컨퍼런스 개최에 따른 고객센터 응대 지연 안내 (6/1)", author: "내셔널 오피스", role: "admin", date: "2026-06-01", pinned: false, views: 174, likes: 3, secret: false,
      body: "내셔널 컨퍼런스 준비 기간 동안 고객센터 응대가 평소보다 지연될 수 있습니다. 양해 부탁드립니다.", comments: [] },
    { id: 5, cat: "Q&A", title: "트레이닝 신청은 어디서 하나요?", author: "이방문", role: "user", date: "2026-05-30", pinned: false, views: 96, likes: 1, secret: false,
      body: "BNI 트레이닝에 처음 참여하려고 합니다. 신청은 어디서 할 수 있을까요?",
      comments: [{ author: "내셔널 오피스", role: "admin", date: "2026-05-30", text: "안녕하세요! 상단 메뉴의 Schedule 페이지에서 원하는 날짜를 선택해 신청하실 수 있습니다." }] },
    { id: 6, cat: "자유", title: "첫 챕터 미팅 후기 남깁니다 :)", author: "최멤버", role: "user", date: "2026-05-28", pinned: false, views: 142, likes: 9, secret: false,
      body: "지난주 처음으로 챕터 미팅에 참여했는데 분위기가 정말 좋았어요. 다음 주에도 참석하려고 합니다!",
      comments: [{ author: "정멤버", role: "user", date: "2026-05-28", text: "저도 다음주에 가요! 후기 감사합니다 :)" }] },
  ];
}

const fmtD = (iso: string) => iso.replace(/-/g, ".");
const todayISO = () => {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

function Badge({ cat }: { cat: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${catCls[cat] || "bg-soft text-body"}`}>
      {catLabel[cat] || cat}
    </span>
  );
}

export function NewsBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [role, setRole] = useState<"user" | "admin">("user");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);

  // load / persist
  useEffect(() => {
    let p: Post[] | null = null;
    try {
      p = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      p = null;
    }
    setPosts(Array.isArray(p) && p.length ? p : seed());
  }, []);
  const persist = (next: Post[]) => {
    setPosts(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const nextId = () => posts.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const opened = openId != null ? posts.find((p) => p.id === openId) : undefined;

  // list
  let list = posts.filter((p) => filter === "all" || p.cat === filter);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) => (p.title + p.body).toLowerCase().includes(q));
  }
  list = [...list].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) || b.id - a.id,
  );

  function openPost(id: number) {
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    if (p.secret && role !== "admin") {
      alert("비밀글입니다. 어드민만 열람할 수 있습니다.");
      return;
    }
    persist(posts.map((x) => (x.id === id ? { ...x, views: x.views + 1 } : x)));
    setOpenId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const updateOpened = (patch: Partial<Post>) =>
    persist(posts.map((x) => (x.id === openId ? { ...x, ...patch } : x)));

  // ===== Detail view =====
  if (opened) {
    const p = opened;
    return (
      <div>
        <button className="btn-line mb-5" onClick={() => setOpenId(null)}>
          ← 목록
        </button>
        <div className="mb-3 flex items-center gap-2">
          <Badge cat={p.cat} />
          {p.pinned && <span className="text-[11px] font-bold text-red">[고정]</span>}
        </div>
        <h2 className="text-2xl font-extrabold leading-snug md:text-3xl">{p.title}</h2>
        <div className="mt-4 flex items-center gap-3 border-b border-line pb-5 text-sm text-body">
          <span className="font-bold text-ink">{p.author}</span>
          {p.role === "admin" && (
            <span className="rounded bg-red px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
          )}
          <span>{fmtD(p.date)}</span>
          <span>· 조회 {p.views}</span>
          <span>· 좋아요 {p.likes}</span>
          {role === "admin" && (
            <span className="ml-auto flex gap-2">
              <button className="btn-line" onClick={() => updateOpened({ pinned: !p.pinned })}>
                {p.pinned ? "고정 해제" : "상단 고정"}
              </button>
              <button
                className="btn-line"
                style={{ color: "#cf2030", borderColor: "#f1c0c4" }}
                onClick={() => {
                  if (confirm("게시글을 삭제할까요?")) {
                    persist(posts.filter((x) => x.id !== p.id));
                    setOpenId(null);
                  }
                }}
              >
                삭제
              </button>
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap py-7 text-[15px] leading-[1.8] text-[#3c4043]">{p.body}</div>
        <div className="border-b border-line pb-8 text-center">
          <button className="btn-line" onClick={() => updateOpened({ likes: p.likes + 1 })}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#e11b2b" }}>
              favorite
            </span>{" "}
            좋아요 {p.likes}
          </button>
        </div>

        <h3 className="mb-2 mt-8 font-extrabold">
          댓글 <span className="text-red">{p.comments.length}</span>
        </h3>
        <div>
          {p.comments.length ? (
            p.comments.map((c, i) => (
              <div className="cmt" key={i}>
                <div className="cmt__av" style={{ background: avColor[c.role] || "#5b6168" }}>
                  {c.author.slice(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2">
                    <b className="text-sm">{c.author}</b>
                    {c.role === "admin" && (
                      <span className="rounded bg-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                        내셔널 오피스
                      </span>
                    )}
                    <span className="text-xs text-body">{fmtD(c.date)}</span>
                    {role === "admin" && (
                      <button
                        className="ml-auto border-none bg-none text-xs text-body"
                        onClick={() => {
                          if (confirm("댓글을 삭제할까요?"))
                            updateOpened({ comments: p.comments.filter((_, k) => k !== i) });
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#3c4043]">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-body">첫 댓글을 남겨보세요.</p>
          )}
        </div>

        <CommentForm
          role={role}
          onSubmit={(text, author) =>
            updateOpened({
              comments: [...p.comments, { author, role, date: todayISO(), text }],
            })
          }
        />
      </div>
    );
  }

  // ===== List view =====
  return (
    <>
      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {CATS.map(([k, l]) => (
            <span key={k} className={`tab ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
              {l}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <span
              className="material-symbols-outlined"
              style={{ position: "absolute", left: 10, top: 9, color: "#9aa0a8", fontSize: 20 }}
            >
              search
            </span>
            <input
              className="inp"
              style={{ width: 200, paddingLeft: 38 }}
              placeholder="제목·내용 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-red" onClick={() => setWriteOpen(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              edit
            </span>{" "}
            글쓰기
          </button>
        </div>
      </div>

      {/* role switch */}
      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-body">현재 권한</span>
        <div className="seg">
          <button className={role === "user" ? "on" : ""} onClick={() => setRole("user")}>
            유저
          </button>
          <button className={role === "admin" ? "on" : ""} onClick={() => setRole("admin")}>
            어드민 (내셔널 오피스)
          </button>
        </div>
        <span className="text-xs text-body">
          {role === "admin"
            ? "· 공지/이벤트 작성, 상단 고정, 글·댓글 삭제, 비밀글 열람 가능"
            : "· 자유게시판·Q&A 작성, 댓글 작성 가능"}
        </span>
      </div>

      {/* list */}
      <table className="board">
        <thead>
          <tr>
            <th style={{ width: 96 }}>구분</th>
            <th>제목</th>
            <th style={{ width: 130 }} className="hidden sm:table-cell">작성자</th>
            <th style={{ width: 108 }} className="hidden sm:table-cell">날짜</th>
            <th style={{ width: 70 }} className="hidden sm:table-cell">조회</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            const secret = p.secret && role !== "admin";
            return (
              <tr key={p.id} className={`row ${p.pinned ? "pin" : ""}`} onClick={() => openPost(p.id)}>
                <td><Badge cat={p.cat} /></td>
                <td className="ttl">
                  {secret ? (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#9aa0a8" }}>
                        lock
                      </span>{" "}
                      비밀글입니다.
                    </>
                  ) : (
                    <>
                      {p.pinned && <b className="mr-1 text-red">[고정]</b>}
                      {p.title}
                      {p.comments.length > 0 && (
                        <span className="font-bold text-red"> [{p.comments.length}]</span>
                      )}
                    </>
                  )}
                </td>
                <td className="hidden sm:table-cell">
                  {p.author}
                  {p.role === "admin" && <span className="text-[10px] font-bold text-red"> ADMIN</span>}
                </td>
                <td className="hidden sm:table-cell">{fmtD(p.date)}</td>
                <td className="hidden sm:table-cell">{p.views}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {list.length === 0 && <p className="py-16 text-center text-body">게시글이 없습니다.</p>}

      {/* write modal */}
      {writeOpen && (
        <WriteModal
          role={role}
          onClose={() => setWriteOpen(false)}
          onSubmit={(post) => {
            persist([...posts, { ...post, id: nextId() }]);
            setFilter("all");
            setWriteOpen(false);
          }}
        />
      )}
    </>
  );
}

function CommentForm({
  role,
  onSubmit,
}: {
  role: "user" | "admin";
  onSubmit: (text: string, author: string) => void;
}) {
  const [author, setAuthor] = useState(role === "admin" ? "내셔널 오피스" : "방문자");
  const [text, setText] = useState("");
  return (
    <div className="mt-5 rounded-2xl bg-soft p-4">
      <div className="mb-2 flex gap-2">
        <input className="inp" style={{ maxWidth: 180 }} value={author} onChange={(e) => setAuthor(e.target.value)} />
        <span className="self-center text-xs text-body">
          {role === "admin" ? "어드민으로 작성" : "유저로 작성"}
        </span>
      </div>
      <textarea
        className="inp"
        rows={3}
        placeholder="따뜻한 댓글로 함께 소통해요"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2 text-right">
        <button
          className="btn-red"
          onClick={() => {
            if (!text.trim()) {
              alert("댓글 내용을 입력하세요.");
              return;
            }
            onSubmit(text.trim(), author.trim() || (role === "admin" ? "내셔널 오피스" : "방문자"));
            setText("");
          }}
        >
          댓글 등록
        </button>
      </div>
    </div>
  );
}

function WriteModal({
  role,
  onClose,
  onSubmit,
}: {
  role: "user" | "admin";
  onClose: () => void;
  onSubmit: (post: Omit<Post, "id">) => void;
}) {
  const opts: [string, string][] =
    role === "admin"
      ? [["공지", "공지"], ["이벤트", "이벤트"], ["자유", "자유게시판"], ["Q&A", "Q&A"]]
      : [["자유", "자유게시판"], ["Q&A", "Q&A"]];
  const [cat, setCat] = useState(opts[0][0]);
  const [author, setAuthor] = useState(role === "admin" ? "내셔널 오피스" : "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [secret, setSecret] = useState(false);

  return (
    <div className="modalbg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modalbox">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-extrabold">글쓰기</h3>
          <button
            className="material-symbols-outlined"
            style={{ border: "none", background: "#f1f3f4", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#5f6368" }}
            onClick={onClose}
          >
            close
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <select className="inp" style={{ width: 160 }} value={cat} onChange={(e) => setCat(e.target.value)}>
              {opts.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input className="inp" placeholder="작성자 이름" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <input className="inp" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="inp" rows={7} placeholder="내용을 입력하세요" value={body} onChange={(e) => setBody(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={secret} onChange={(e) => setSecret(e.target.checked)} /> 비밀글 (작성자/어드민만 열람)
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-line" onClick={onClose}>
            취소
          </button>
          <button
            className="btn-red"
            onClick={() => {
              if (!title.trim()) return alert("제목을 입력하세요.");
              if (!body.trim()) return alert("내용을 입력하세요.");
              onSubmit({
                cat,
                title: title.trim(),
                author: author.trim() || (role === "admin" ? "내셔널 오피스" : "방문자"),
                role,
                date: todayISO(),
                pinned: false,
                views: 0,
                likes: 0,
                secret,
                body: body.trim(),
                comments: [],
              });
            }}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
