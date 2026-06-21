/* =========================================================
   BNI Korea Hub — 공통 데이터 레이어 (shared data layer)
   ---------------------------------------------------------
   store / schedule / admin 의 단일 데이터 소스.
   현재는 브라우저 localStorage를 임시 DB로 사용한다.

   ▶ 추후 실제 DB(API) 연동 시:
     getProducts / setProducts / getEvents / setEvents /
     getTrainings / setTrainings 내부만 fetch(...)로 교체하면
     나머지 화면 코드는 수정할 필요가 없다.
   ========================================================= */
(function (global) {
  "use strict";

  const KEYS = {
    products: "bni_products",
    events: "bni_events",
    trainings: "bni_trainings",
    users: "bni_users",
    orders: "bni_orders",
    orderItems: "bni_order_items",
    enrollments: "bni_enrollments",
    spaces: "bni_spaces",
    reservations: "bni_reservations",
    activities: "bni_activities",
  };

  /* ---------------------------------------------------------
     기본(시드) 데이터 — 최초 1회만 localStorage에 적재된다.
     --------------------------------------------------------- */

  // 스토어 상품 (id / name / category / price / img / stock)
  const DEFAULT_PRODUCTS = [
    { id: "pouch-mug-set", name: "웰컴 머그 & 파우치 세트", category: "세트", price: 45000, img: "BNI Korea_pouch_mug set.png", stock: 12 },
    { id: "mug", name: "BNI KOREA 텀블러 머그 (대나무 뚜껑)", category: "리빙", price: 18000, img: "BNI Korea_mug (1).jpg", stock: 30 },
    { id: "scarf-red", name: "로고 실크 스카프 (레드)", category: "액세서리", price: 39000, img: "BNI Korea_로고 실크 스카프_레드.jpg", stock: 8 },
    { id: "scarf-white", name: "로고 실크 100% 스카프 (화이트)", category: "액세서리", price: 45000, img: "BNI Korea_로고 실크 100% 스카프_화이트.jpg", stock: 6 },
    { id: "cap", name: "BNI KOREA 볼캡 (블랙 / 레드 / 화이트)", category: "의류", price: 22000, img: "BNI Korea_볼캡 3종.png", stock: 40 },
    { id: "polo-black", name: "BNI 카라 티셔츠 (블랙)", category: "의류", price: 35000, img: "카라티_블랙-removebg-preview.png", stock: 25 },
    { id: "polo-white", name: "BNI 카라 티셔츠 (화이트)", category: "의류", price: 35000, img: "카라티_화이트-removebg-preview.png", stock: 25 },
    { id: "hoodie", name: "BNI 후드 집업 (그레이)", category: "의류", price: 58000, img: "후드집업_앞-removebg-preview.png", stock: 15 },
    { id: "tie-classic", name: "BNI 클래식 넥타이", category: "액세서리", price: 32000, img: "BNI Korea_클래식 타이 (1).jpg", stock: 18 },
    { id: "tie-auto", name: "BNI 자동 넥타이", category: "액세서리", price: 29000, img: "BNI Korea_자동 타이 (1).jpg", stock: 18 },
    { id: "welcome-pouch", name: "웰컴팩 파우치 (레드)", category: "잡화", price: 28000, img: "BNI Korea_welcome_pack_pouch (1).jpg", stock: 20 },
    { id: "tablecloth", name: "BNI 테이블보 (레드)", category: "리빙", price: 42000, img: "BNI Korea_테이블보.jpg", stock: 10 },
    { id: "badge-torch", name: "횃불 엠블럼 뱃지", category: "뱃지", price: 12000, img: "BNI Korea_횃불뱃지.png", stock: 50 },
    { id: "badge-nc26", name: "2026 National Conference 기념 뱃지", category: "뱃지", price: 15000, img: "BNI Korea_nc26뱃지 (1).jpg", stock: 50 },
  ];

  // 캘린더 일정 (월: 2026-06 기준 / day = 일, color = 색상 클래스)
  const DEFAULT_EVENTS = [
    { id: "e1", day: 1, title: "마포 챕터 미팅", color: "c-red" },
    { id: "e2", day: 1, title: "코칭타운 정기 코칭", color: "c-blue" },
    { id: "e3", day: 2, title: "영등포 1:1 미팅", color: "c-green" },
    { id: "e4", day: 2, title: "서초 오리엔테이션", color: "c-purple" },
    { id: "e5", day: 2, title: "COO 주간 회의", color: "c-gray" },
    { id: "e6", day: 3, title: "주간 뉴스레터 발송", color: "c-gray" },
    { id: "e7", day: 4, title: "수원1 멤버데이", color: "c-red" },
    { id: "e8", day: 4, title: "코칭타운", color: "c-blue" },
    { id: "e9", day: 5, title: "주간 결산 미팅", color: "c-blue" },
    { id: "e10", day: 8, title: "리더십 트레이닝", color: "c-purple" },
    { id: "e11", day: 8, title: "생일: 박멤버", color: "c-green dotstyle" },
    { id: "e12", day: 9, title: "마포 멤버 트레이닝", color: "c-red" },
    { id: "e13", day: 9, title: "영등포 미팅", color: "c-green" },
    { id: "e14", day: 9, title: "COO 회의", color: "c-gray" },
    { id: "e15", day: 10, title: "코칭타운 코칭", color: "c-blue" },
    { id: "e16", day: 11, title: "네트워킹 세미나", color: "c-green" },
    { id: "e17", day: 11, title: "대한민국의 휴일 점검", color: "c-purple dotstyle" },
    { id: "e18", day: 12, title: "주간 결산", color: "c-blue" },
    { id: "e19", day: 14, title: "Equity Asia for HQ", color: "c-mag" },
    { id: "e20", day: 15, title: "NOM 정기 National Conference", color: "c-mag" },
    { id: "e21", day: 15, title: "챕터 합동 트레이닝", color: "c-purple" },
    { id: "e22", day: 16, title: "BNI Philippines National Conf.", color: "c-mag" },
    { id: "e23", day: 16, title: "신규 멤버 교육", color: "c-red" },
    { id: "e24", day: 17, title: "APEX NOVO Summit (Philippines)", color: "c-mag" },
    { id: "e25", day: 17, title: "코칭타운", color: "c-blue" },
    { id: "e26", day: 18, title: "한국지사대표 컨퍼런스 참여", color: "c-mag" },
    { id: "e27", day: 18, title: "비즈니스 발표회", color: "c-blue" },
    { id: "e28", day: 19, title: "BNI Taiwan National Conference", color: "c-mag" },
    { id: "e29", day: 22, title: "서초 챕터 미팅", color: "c-red" },
    { id: "e30", day: 22, title: "대외 홍보전략 회의", color: "c-blue" },
    { id: "e31", day: 22, title: "COO 회의", color: "c-gray" },
    { id: "e32", day: 23, title: "리더 워크숍", color: "c-purple" },
    { id: "e33", day: 24, title: "코칭타운 코칭", color: "c-blue" },
    { id: "e34", day: 25, title: "수원1 멤버 트레이닝", color: "c-red" },
    { id: "e35", day: 25, title: "생일: 김디렉터", color: "c-green dotstyle" },
    { id: "e36", day: 26, title: "BNI Taiwan National Conference", color: "c-mag" },
    { id: "e37", day: 29, title: "월말 결산 미팅", color: "c-green" },
    { id: "e38", day: 30, title: "대표 면담", color: "c-gray" },
    { id: "e39", day: 30, title: "7월 일정 준비", color: "c-navy" },
  ];

  // 트레이닝 (신청 가능한 상세 정보)
  const DEFAULT_TRAININGS = [
    { id: "t1", day: 1, title: "마포 챕터 미팅", chapter: "마포 챕터", who: "김지훈 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1517245386807-bb43f82c33c4" },
    { id: "t2", day: 2, title: "영등포 1:1 미팅", chapter: "영등포 챕터", who: "박서연 트레이너", time: "14:00 – 15:30", status: "모집중", img: "photo-1600880292203-757bb62b4baf" },
    { id: "t3", day: 2, title: "서초 오리엔테이션", chapter: "서초 챕터", who: "이정민 디렉터", time: "19:00 – 21:00", status: "모집중", img: "photo-1573164713988-8665fc963095" },
    { id: "t4", day: 4, title: "수원1 멤버데이", chapter: "수원1 챕터", who: "정하늘 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1559136555-9303baea8ebd" },
    { id: "t5", day: 8, title: "리더십 트레이닝", chapter: "코리아 본부", who: "최우진 대표 트레이너", time: "10:00 – 13:00", status: "모집중", img: "photo-1542744094-3a31f272c490" },
    { id: "t6", day: 9, title: "마포 멤버 트레이닝", chapter: "마포 챕터", who: "김지훈 디렉터", time: "07:00 – 09:00", status: "진행중", img: "photo-1556761175-5973dc0f32e7" },
    { id: "t7", day: 9, title: "영등포 미팅", chapter: "영등포 챕터", who: "박서연 트레이너", time: "14:00 – 15:30", status: "모집중", img: "photo-1521737604893-d14cc237f11d" },
    { id: "t8", day: 11, title: "네트워킹 세미나", chapter: "코리아 본부", who: "한지윤 매니저", time: "18:30 – 20:30", status: "모집중", img: "photo-1551836022-d5d88e9218df" },
    { id: "t9", day: 15, title: "챕터 합동 트레이닝", chapter: "합동 4개 챕터", who: "최우진 대표 트레이너", time: "09:00 – 12:00", status: "모집중", img: "photo-1552664730-d307ca884978" },
    { id: "t10", day: 16, title: "신규 멤버 교육", chapter: "마포 챕터", who: "김지훈 디렉터", time: "19:00 – 21:00", status: "모집중", img: "photo-1517048676732-d65bc937f952" },
    { id: "t11", day: 18, title: "비즈니스 발표회", chapter: "서초 챕터", who: "이정민 디렉터", time: "14:00 – 16:00", status: "모집중", img: "photo-1475721027785-f74eccf877e2" },
    { id: "t12", day: 22, title: "서초 챕터 미팅", chapter: "서초 챕터", who: "이정민 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1591115765373-5207764f72e7" },
    { id: "t13", day: 23, title: "리더 워크숍", chapter: "코리아 본부", who: "최우진 대표 트레이너", time: "10:00 – 13:00", status: "모집중", img: "photo-1454165804606-c3d57bc86b40" },
    { id: "t14", day: 25, title: "수원1 멤버 트레이닝", chapter: "수원1 챕터", who: "정하늘 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1556157382-97eda2d62296" },
    { id: "t15", day: 29, title: "월말 결산 미팅", chapter: "코리아 본부", who: "한지윤 매니저", time: "18:00 – 20:00", status: "마감임박", img: "photo-1517502884422-41eaead166d4" },
  ];

  // 대관 가능한 공간(회의실)
  const DEFAULT_SPACES = [
    {
      id: "sp1", name: "대회의실", area: 66, capacity: 30, hourly_price: 50000,
      img: "photo-1517245386807-bb43f82c33c4", location: "본사 3층",
      images: ["photo-1517245386807-bb43f82c33c4", "photo-1517502884422-41eaead166d4", "photo-1543269865-cbf427effbad"],
      description: "대규모 세미나·총회·발표회에 적합한 프리미엄 대회의실입니다. 자연 채광과 고급 음향 설비를 갖췄습니다.",
      amenities: ["빔프로젝터·스크린", "화상회의 시스템", "무선 마이크 2개", "화이트보드", "고속 Wi-Fi", "냉난방"],
    },
    {
      id: "sp2", name: "중회의실", area: 33, capacity: 12, hourly_price: 30000,
      img: "photo-1600880292203-757bb62b4baf", location: "본사 3층",
      images: ["photo-1600880292203-757bb62b4baf", "photo-1556761175-5973dc0f32e7", "photo-1552664730-d307ca884978"],
      description: "팀 미팅·워크숍에 알맞은 중형 회의실입니다. 화상회의와 자료 공유에 최적화되어 있습니다.",
      amenities: ["빔프로젝터", "화상회의 시스템", "화이트보드", "Wi-Fi", "냉난방"],
    },
    {
      id: "sp3", name: "소회의실", area: 16, capacity: 6, hourly_price: 20000,
      img: "photo-1521737604893-d14cc237f11d", location: "본사 2층",
      images: ["photo-1521737604893-d14cc237f11d", "photo-1600880292203-757bb62b4baf", "photo-1517245386807-bb43f82c33c4"],
      description: "소규모 미팅·1:1 상담에 최적화된 아늑한 공간입니다.",
      amenities: ["벽걸이 모니터", "화이트보드", "Wi-Fi", "냉난방"],
    },
    {
      id: "sp4", name: "세미나룸", area: 99, capacity: 50, hourly_price: 70000,
      img: "photo-1552664730-d307ca884978", location: "별관 1층",
      images: ["photo-1552664730-d307ca884978", "photo-1543269865-cbf427effbad", "photo-1517502884422-41eaead166d4"],
      description: "강연·교육·대형 행사에 적합한 세미나룸입니다. 무대와 전문 음향 설비를 갖췄습니다.",
      amenities: ["무대·단상", "전문 음향 시스템", "빔프로젝터·대형 스크린", "무선 마이크 4개", "Wi-Fi", "냉난방"],
    },
  ];

  // 데모용 샘플 유저 + 여정 (제품 구매 + 대관을 모두 이용한 1명)
  const DEFAULT_USERS = [
    { id: "u1", name: "홍길동", phone: "01012345678", email: "hong@example.com", created_at: "2026-06-01T09:00:00+09:00" },
  ];
  const DEFAULT_ORDERS = [
    { id: "o1", user_id: "u1", total: 18000, status: "결제완료", created_at: "2026-06-10T10:00:00+09:00" },
  ];
  const DEFAULT_ORDER_ITEMS = [
    { id: "oi1", order_id: "o1", product_id: "mug", qty: 1, unit_price: 18000 },
  ];
  const DEFAULT_ENROLLMENTS = [];
  const DEFAULT_RESERVATIONS = [
    { id: "r1", user_id: "u1", space_id: "sp2", date: "2026-06-15", time: "14:00", duration: 60, memo: "팀 미팅", email: "hong@example.com", status: "확정", created_at: "2026-06-11T09:00:00+09:00" },
  ];
  const DEFAULT_ACTIVITIES = [
    { id: "a1", user_id: "u1", type: "order", ref_id: "o1", title: "BNI KOREA 텀블러 머그 구매", amount: 18000, created_at: "2026-06-10T10:00:00+09:00" },
    { id: "a2", user_id: "u1", type: "reservation", ref_id: "r1", title: "중회의실 대관 (6/15 14:00)", amount: 30000, created_at: "2026-06-11T09:00:00+09:00" },
  ];

  const DEFAULTS = {
    [KEYS.products]: DEFAULT_PRODUCTS,
    [KEYS.events]: DEFAULT_EVENTS,
    [KEYS.trainings]: DEFAULT_TRAININGS,
    [KEYS.users]: DEFAULT_USERS,
    [KEYS.orders]: DEFAULT_ORDERS,
    [KEYS.orderItems]: DEFAULT_ORDER_ITEMS,
    [KEYS.enrollments]: DEFAULT_ENROLLMENTS,
    [KEYS.spaces]: DEFAULT_SPACES,
    [KEYS.reservations]: DEFAULT_RESERVATIONS,
    [KEYS.activities]: DEFAULT_ACTIVITIES,
  };

  /* ---------------------------------------------------------
     저장소 접근 (localStorage 불가 시 메모리 폴백)
     --------------------------------------------------------- */
  const memory = {};
  function hasLS() {
    try {
      const k = "__bni_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }
  const LS = hasLS();

  function read(key) {
    if (LS) {
      const raw = localStorage.getItem(key);
      if (raw == null) {
        write(key, DEFAULTS[key]); // 최초 시드
        return clone(DEFAULTS[key]);
      }
      try {
        return JSON.parse(raw);
      } catch (e) {
        return clone(DEFAULTS[key]);
      }
    }
    if (!(key in memory)) memory[key] = clone(DEFAULTS[key]);
    return clone(memory[key]);
  }

  function write(key, value) {
    if (LS) localStorage.setItem(key, JSON.stringify(value));
    else memory[key] = clone(value);
    return value;
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function genId(prefix) {
    return (
      (prefix || "id") +
      "-" +
      Date.now().toString(36) +
      Math.floor(Math.random() * 1e4).toString(36)
    );
  }

  function now() {
    return new Date().toISOString();
  }

  function normPhone(p) {
    return String(p || "").replace(/\D/g, "");
  }

  /* ---------------------------------------------------------
     공개 API
     --------------------------------------------------------- */
  const BNIData = {
    KEYS,

    // 상품
    getProducts() {
      return read(KEYS.products);
    },
    setProducts(list) {
      return write(KEYS.products, list);
    },

    // 일정(캘린더 이벤트)
    getEvents() {
      return read(KEYS.events);
    },
    setEvents(list) {
      return write(KEYS.events, list);
    },
    // schedule.html이 기대하는 {day:[[title,color],...]} 형태로 변환
    getEventsByDay() {
      const map = {};
      read(KEYS.events).forEach((e) => {
        (map[e.day] = map[e.day] || []).push([e.title, e.color]);
      });
      return map;
    },

    // 트레이닝
    getTrainings() {
      return read(KEYS.trainings);
    },
    setTrainings(list) {
      return write(KEYS.trainings, list);
    },
    // schedule.html이 기대하는 {day:[{t,chapter,who,time,status,img},...]} 형태로 변환
    getTrainingsByDay() {
      const map = {};
      read(KEYS.trainings).forEach((t) => {
        (map[t.day] = map[t.day] || []).push({
          t: t.title,
          chapter: t.chapter,
          who: t.who,
          time: t.time,
          status: t.status,
          img: t.img,
        });
      });
      return map;
    },

    /* ===== 유저 (전화번호 통합 키) ===== */
    getUsers() {
      return read(KEYS.users);
    },
    setUsers(list) {
      return write(KEYS.users, list);
    },
    findUserByPhone(phone) {
      const np = normPhone(phone);
      return read(KEYS.users).find((u) => normPhone(u.phone) === np) || null;
    },
    // 전화번호로 find-or-create. 이름/이메일이 들어오면 보강 업데이트.
    upsertUser({ name, phone, email }) {
      const np = normPhone(phone);
      const users = read(KEYS.users);
      let u = users.find((x) => normPhone(x.phone) === np);
      if (u) {
        if (name) u.name = name;
        if (email) u.email = email;
      } else {
        u = { id: genId("u"), name: name || "", phone: np, email: email || "", created_at: now() };
        users.push(u);
      }
      write(KEYS.users, users);
      return clone(u);
    },

    /* ===== 공간(대관) ===== */
    getSpaces() {
      return read(KEYS.spaces);
    },
    setSpaces(list) {
      return write(KEYS.spaces, list);
    },

    /* ===== 통합 여정 로그 ===== */
    getActivities() {
      return read(KEYS.activities);
    },
    addActivity({ user_id, type, ref_id, title, amount }) {
      const list = read(KEYS.activities);
      const a = { id: genId("a"), user_id, type, ref_id, title: title || "", amount: amount || 0, created_at: now() };
      list.push(a);
      write(KEYS.activities, list);
      return a;
    },

    /* ===== 주문(제품 구매) ===== */
    getOrders() {
      return read(KEYS.orders);
    },
    getOrderItems() {
      return read(KEYS.orderItems);
    },
    // items: [{ product_id, qty, unit_price }]  → 주문/상세 저장 + 재고차감 + 여정 기록
    addOrder(user_id, items) {
      const products = read(KEYS.products);
      const total = items.reduce((s, it) => s + it.unit_price * it.qty, 0);
      const order = { id: genId("o"), user_id, total, status: "결제완료", created_at: now() };
      write(KEYS.orders, read(KEYS.orders).concat(order));

      const oiList = read(KEYS.orderItems);
      items.forEach((it) => {
        oiList.push({ id: genId("oi"), order_id: order.id, product_id: it.product_id, qty: it.qty, unit_price: it.unit_price });
        const p = products.find((x) => x.id === it.product_id);
        if (p) p.stock = Math.max(0, (p.stock || 0) - it.qty);
      });
      write(KEYS.orderItems, oiList);
      write(KEYS.products, products);

      const first = products.find((x) => x.id === items[0].product_id);
      const title = (first ? first.name : "상품") + (items.length > 1 ? ` 외 ${items.length - 1}건` : "") + " 구매";
      this.addActivity({ user_id, type: "order", ref_id: order.id, title, amount: total });
      return order;
    },

    /* ===== 트레이닝 신청/구매 ===== */
    getEnrollments() {
      return read(KEYS.enrollments);
    },
    addEnrollment(user_id, training_id) {
      const tr = read(KEYS.trainings).find((t) => t.id === training_id);
      const amount = (tr && tr.price) || 0;
      const en = { id: genId("en"), user_id, training_id, amount, status: "신청완료", created_at: now() };
      write(KEYS.enrollments, read(KEYS.enrollments).concat(en));
      this.addActivity({ user_id, type: "enrollment", ref_id: en.id, title: (tr ? tr.title : "트레이닝") + " 신청", amount });
      return en;
    },

    /* ===== 대관 예약 ===== */
    getReservations() {
      return read(KEYS.reservations);
    },
    getReservationsByDate(dateStr) {
      return read(KEYS.reservations).filter((r) => r.date === dateStr && r.status !== "취소");
    },
    getReservationsByPhone(phone) {
      const u = this.findUserByPhone(phone);
      if (!u) return [];
      return read(KEYS.reservations)
        .filter((r) => r.user_id === u.id)
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
    // data: { user_id, space_id, date, time, duration, memo, email, extra, options, payment_method }
    addReservation(data) {
      const space = read(KEYS.spaces).find((s) => s.id === data.space_id);
      const base = space ? Math.round((space.hourly_price * (data.duration || 60)) / 60) : 0;
      const extra = data.extra || 0; // 추가 옵션(유료) 합계
      const amount = base + extra;
      const r = {
        id: genId("r"),
        user_id: data.user_id,
        space_id: data.space_id,
        date: data.date,
        time: data.time,
        duration: data.duration || 60,
        memo: data.memo || "",
        email: data.email || "",
        options: data.options || [],
        extra,
        amount,
        payment_method: data.payment_method || "",
        status: "확정",
        created_at: now(),
      };
      write(KEYS.reservations, read(KEYS.reservations).concat(r));
      const dt = `${data.date.slice(5).replace("-", "/")} ${data.time}`;
      this.addActivity({ user_id: data.user_id, type: "reservation", ref_id: r.id, title: `${space ? space.name : "공간"} 대관 (${dt})`, amount });
      return r;
    },
    setReservations(list) {
      return write(KEYS.reservations, list);
    },
    updateReservation(id, patch) {
      const list = read(KEYS.reservations).map((r) => (r.id === id ? Object.assign({}, r, patch) : r));
      return write(KEYS.reservations, list);
    },

    /* ===== 통합 여정 조회 ===== */
    getUserJourney(phone) {
      const u = this.findUserByPhone(phone);
      if (!u) return null;
      const byUser = (arr) => arr.filter((x) => x.user_id === u.id);
      return {
        user: u,
        orders: byUser(read(KEYS.orders)),
        enrollments: byUser(read(KEYS.enrollments)),
        reservations: byUser(read(KEYS.reservations)),
        activities: byUser(read(KEYS.activities)).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")),
      };
    },

    genId,

    // 전체 초기화(시드값으로 복원)
    resetAll() {
      Object.keys(DEFAULTS).forEach((k) => write(k, DEFAULTS[k]));
    },

    // 기본값 노출 (참고용)
    DEFAULTS: { DEFAULT_PRODUCTS, DEFAULT_EVENTS, DEFAULT_TRAININGS },
  };

  global.BNIData = BNIData;
})(window);
