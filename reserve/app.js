// ===== 데이터 레이어 (shared/data.js) =====
// 기존 Supabase / Google Calendar 연동을 BNIData(localStorage)로 대체.
// 추후 실제 DB로 옮길 때는 shared/data.js의 헬퍼만 교체하면 된다.

// ===== State =====
let userName = '';
let userPhone = '';
let userId = null;          // upsertUser로 확보한 유저 id
let selectedSpaceId = null; // 안내 페이지에서 먼저 선택한 공간

// 공간 사진 URL (Unsplash photo id 저장)
function spaceImgUrl(img, w) {
  if (!img) return '';
  return `https://images.unsplash.com/${img}?auto=format&fit=crop&w=${w || 600}&h=${Math.round((w || 600) * 0.62)}&q=80`;
}
function findSpace(id) {
  return BNIData.getSpaces().find((s) => s.id === id) || null;
}

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// 대한민국 공휴일 (MM-DD 고정 공휴일 + 연도별 음력 공휴일)
const holidays = {
  fixed: ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'],
  '2025': ['01-28', '01-29', '01-30', '05-05', '05-06'],
  '2026': ['02-16', '02-17', '02-18', '05-24', '09-24', '09-25', '09-26'],
  '2027': ['02-05', '02-06', '02-07', '05-13', '10-13', '10-14', '10-15'],
};

function isHoliday(date) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const year = String(date.getFullYear());
  return holidays.fixed.includes(mmdd) || (holidays[year] && holidays[year].includes(mmdd));
}

function isDateDisabled(date) {
  const day = date.getDay();
  return day === 0 || day === 6 || isHoliday(date);
}

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let selectedDate = new Date(currentYear, currentMonth, today.getDate());
while (isDateDisabled(selectedDate)) {
  selectedDate.setDate(selectedDate.getDate() + 1);
}
currentYear = selectedDate.getFullYear();
currentMonth = selectedDate.getMonth();
let selectedTime = null;
let busyTimes = [];

const baseTimeSlots = [
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00',
];

// ===== Page Navigation =====
function showPage(page) {
  document.getElementById('pageGuide').classList.toggle('hidden', page !== 'guide');
  document.getElementById('pageIntro').classList.toggle('hidden', page !== 'intro');
  document.getElementById('pageBooking').classList.toggle('hidden', page !== 'booking');
  document.getElementById('pageMyBookings').classList.toggle('hidden', page !== 'myBookings');
  if (page === 'guide' || page === 'intro') window.scrollTo({ top: 0 });

  if (page === 'intro') {
    renderIntroSpace();
  }

  if (page === 'myBookings') {
    document.getElementById('lookupResults').classList.add('hidden');
    document.getElementById('lookupEmpty').classList.add('hidden');
    document.getElementById('lookupPhone').value = '';
  }

  if (page === 'booking') {
    document.getElementById('displayName').textContent = userName;
    document.getElementById('displayPhone').textContent = userPhone || '없음';
    document.getElementById('timeSlotDate').textContent = selectedDate
      ? formatDate(selectedDate)
      : '날짜를 선택하세요';
    // 안내 페이지에서 고른 공간을 옵션 단계 select에 미리 반영
    const ss = document.getElementById('serviceSelect');
    if (ss && selectedSpaceId) ss.value = selectedSpaceId;
    updateBookingSpace();
    refreshAmount();
    renderCalendar();
    if (selectedDate) {
      fetchBusyTimes(selectedDate);
    } else {
      renderTimeSlots();
    }
  }
}

// ===== Intro Page =====
const nameInput = document.getElementById('nameInput');
const nameClear = document.getElementById('nameClear');
const homeForm = document.getElementById('homeForm');

nameInput.addEventListener('input', () => {
  nameClear.style.display = nameInput.value ? 'block' : 'none';
});

nameClear.addEventListener('click', () => {
  nameInput.value = '';
  nameClear.style.display = 'none';
  nameInput.focus();
});

homeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  userName = nameInput.value.trim();
  userPhone = document.getElementById('phoneInput').value.replace(/-/g, '');
  if (userName && userPhone) {
    // 전화번호 통합 키로 유저 find-or-create (여정 기록의 주체)
    const user = BNIData.upsertUser({ name: userName, phone: userPhone });
    userId = user.id;
    showPage('booking');
  }
});

// ===== 공간 목록 채우기 (BNIData.getSpaces) =====
function populateSpaces() {
  const sel = document.getElementById('serviceSelect');
  if (!sel) return;
  const spaces = BNIData.getSpaces();
  sel.innerHTML =
    '<option value="" disabled selected>공간을 선택해주세요</option>' +
    spaces
      .map(
        (s) =>
          `<option value="${s.id}">${s.name} (${s.capacity}인 · ${s.hourly_price.toLocaleString('ko-KR')}원/시간)</option>`
      )
      .join('');
}

// 공간 사진들 (images 배열, 없으면 img 단일)
function spaceImages(s) {
  return (s.images && s.images.length) ? s.images : (s.img ? [s.img] : []);
}

// 카드용 사진 캐러셀 마크업
function spaceCarousel(s) {
  const imgs = spaceImages(s);
  return `<div class="gs-carousel" data-id="${s.id}" data-idx="0">
    <div class="gs-car-img" style="background-image:url('${spaceImgUrl(imgs[0], 500)}')"></div>
    ${imgs.length > 1 ? `
      <button type="button" class="gs-car-nav prev" data-dir="-1" aria-label="이전 사진">&#8249;</button>
      <button type="button" class="gs-car-nav next" data-dir="1" aria-label="다음 사진">&#8250;</button>
      <div class="gs-car-dots">${imgs.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>` : ''}
  </div>`;
}

// ===== 안내 페이지의 공간 카드 채우기 (사진 캐러셀 + 선택 버튼) =====
function renderGuideSpaces() {
  const el = document.getElementById('guideSpaces');
  if (!el) return;
  el.innerHTML = BNIData.getSpaces()
    .map(
      (s) => `
      <div class="guide-space" data-id="${s.id}">
        ${spaceCarousel(s)}
        <div class="guide-space__body">
          <div class="guide-space__name">${s.name}</div>
          <div class="guide-space__meta">면적 ${s.area}㎡ · 수용 ${s.capacity}인</div>
          <div class="guide-space__price">${s.hourly_price.toLocaleString('ko-KR')}원<span class="per"> / 시간</span></div>
          <button type="button" class="btn btn-primary guide-space__btn" data-select="${s.id}">이 공간 예약하기</button>
        </div>
      </div>`
    )
    .join('');
}

// 공간 선택 → 예약자 정보 입력으로
function selectSpace(id) {
  selectedSpaceId = id;
  showPage('intro');
}

// 예약자 정보(intro) 화면 하단에 선택한 공간 상세 + 사진 캐러셀
function renderIntroSpace() {
  const el = document.getElementById('introSpace');
  if (!el) return;
  const s = findSpace(selectedSpaceId);
  if (!s) { el.innerHTML = ''; return; }

  const imgs = (s.images && s.images.length) ? s.images : (s.img ? [s.img] : []);
  const amen = (s.amenities && s.amenities.length)
    ? `<div class="sp-detail__amen">${s.amenities.map((a) => `<span class="amen">${a}</span>`).join('')}</div>` : '';
  const desc = s.description ? `<p class="sp-detail__desc">${s.description}</p>` : '';
  const loc = s.location ? `📍 ${s.location} · ` : '';

  el.innerHTML = `
    <div class="intro-space__label">선택한 공간</div>
    <div class="sp-detail">
      <div class="sp-carousel">
        <div class="sp-car-img" id="spCarImg" style="background-image:url('${spaceImgUrl(imgs[0], 700)}')"></div>
        ${imgs.length > 1 ? `
          <button type="button" class="sp-car-nav prev" id="spCarPrev" aria-label="이전 사진">&#8249;</button>
          <button type="button" class="sp-car-nav next" id="spCarNext" aria-label="다음 사진">&#8250;</button>
          <div class="sp-car-dots" id="spCarDots">${imgs.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}" data-i="${i}"></span>`).join('')}</div>` : ''}
      </div>
      <div class="sp-detail__body">
        <div class="sp-detail__name">${s.name}</div>
        <div class="sp-detail__meta">${loc}면적 ${s.area}㎡ · 수용 ${s.capacity}인</div>
        <div class="sp-detail__price">${s.hourly_price.toLocaleString('ko-KR')}원 <span class="per">/ 시간</span></div>
        ${desc}
        ${amen}
      </div>
    </div>`;

  // 캐러셀 좌우 전환
  if (imgs.length > 1) {
    let idx = 0;
    const imgEl = document.getElementById('spCarImg');
    const dots = document.getElementById('spCarDots');
    const go = (i) => {
      idx = (i + imgs.length) % imgs.length;
      imgEl.style.backgroundImage = `url('${spaceImgUrl(imgs[idx], 700)}')`;
      dots.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('active', k === idx));
    };
    document.getElementById('spCarPrev').addEventListener('click', () => go(idx - 1));
    document.getElementById('spCarNext').addEventListener('click', () => go(idx + 1));
    dots.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) go(+d.dataset.i); });
  }
}

// 예약 진행 화면(왼쪽 패널)에 선택한 공간 표시 + serviceSelect 동기화
function updateBookingSpace() {
  const ss = document.getElementById('serviceSelect');
  const id = (ss && ss.value) || selectedSpaceId;
  const s = findSpace(id);
  const box = document.getElementById('displaySpace');
  if (box) {
    box.innerHTML = s
      ? `<div class="ds-photo" style="background-image:url('${spaceImgUrl(s.img, 240)}')"></div>
         <div><div class="ds-name">${s.name}</div><div class="ds-price">${s.hourly_price.toLocaleString('ko-KR')}원/시간</div></div>`
      : '';
    box.classList.toggle('hidden', !s);
  }
}

// ===== Calendar =====
function formatDate(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`;
}

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderCalendar() {
  const cal = document.getElementById('calendar');
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

  let html = `
    <div class="calendar-header">
      <div class="calendar-title">${monthNames[currentMonth]} ${currentYear}</div>
      <div class="calendar-nav">
        <button onclick="prevMonth()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button onclick="nextMonth()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
    </div>
    <div class="calendar-weekdays">
      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>
    <div class="calendar-days">`;

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<button class="calendar-day outside" disabled>${daysInPrev - i}</button>`;
  }

  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(currentYear, currentMonth, d);
    const disabled = isDateDisabled(thisDate);
    let cls = 'calendar-day';
    if (disabled) cls += ' outside';
    else if (selectedDate && selectedDate.getTime() === thisDate.getTime()) cls += ' selected';
    else if (today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d) cls += ' today';
    html += `<button class="${cls}" ${disabled ? 'disabled' : `onclick="selectDate(${currentYear},${currentMonth},${d})"`}>${d}</button>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<button class="calendar-day outside" disabled>${i}</button>`;
  }

  html += '</div>';
  cal.innerHTML = html;
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}

function selectDate(y, m, d) {
  selectedDate = new Date(y, m, d);
  currentYear = y;
  currentMonth = m;
  renderCalendar();
  document.getElementById('timeSlotDate').textContent = formatDate(selectedDate);
  fetchBusyTimes(selectedDate);
}

// ===== 예약된 시간 계산 (BNIData) =====
// 해당 날짜의 기존 예약(시작시각 + 이용시간)을 busy 구간으로 변환한다.
function fetchBusyTimes(date) {
  const dateStr = formatDateStr(date);
  const reservations = BNIData.getReservationsByDate(dateStr);

  busyTimes = reservations.map((r) => {
    const [h, m] = (r.time || '00:00').split(':').map(Number);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
    const end = new Date(start.getTime() + (r.duration || 60) * 60 * 1000);
    return { start, end };
  });

  renderTimeSlots();
}

function isTimeBusy(timeStr, date) {
  const [h, m] = timeStr.split(':').map(Number);
  const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30분 단위

  return busyTimes.some(busy => slotStart < busy.end && slotEnd > busy.start);
}

// ===== Time Slots =====
function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  container.innerHTML = baseTimeSlots
    .map((time) => {
      const available = !isTimeBusy(time, selectedDate);
      const isSelected = selectedTime === time;
      if (!available) {
        return `<div class="time-slot-row">
          <button class="time-slot-btn unavailable" disabled>${time}</button>
          <div class="time-slot-next visible unavailable">
            <button disabled>예약됨</button>
          </div>
        </div>`;
      }
      return `
        <div class="time-slot-row">
          <button class="time-slot-btn ${isSelected ? 'selected' : ''}" onclick="selectTime('${time}')">${time}</button>
          <div class="time-slot-next visible ${isSelected ? '' : 'placeholder'}">
            <button ${isSelected ? 'onclick="goToForm()"' : 'disabled'}>${isSelected ? '다음' : '예약'}</button>
          </div>
        </div>`;
    })
    .join('');
}

function selectTime(time) {
  selectedTime = time;
  renderTimeSlots();
}

// ===== Booking Steps =====
let currentStep = 'select';

function showStep(step) {
  currentStep = step;
  document.getElementById('stepSelect').classList.toggle('hidden', step !== 'select');
  document.getElementById('stepForm').classList.toggle('hidden', step !== 'form');
  document.getElementById('stepPayment').classList.toggle('hidden', step !== 'payment');
  document.getElementById('stepSuccess').classList.toggle('hidden', step !== 'success');
  // 뒤로가기는 옵션/결제 단계에서만 노출
  document.getElementById('backBtn').classList.toggle('hidden', !(step === 'form' || step === 'payment'));

  const left = document.getElementById('bookingLeft');
  left.classList.toggle('form-step', step !== 'select');

  const dt = document.getElementById('selectedDatetime');
  if ((step === 'form' || step === 'payment' || step === 'success') && selectedTime && selectedDate) {
    dt.classList.remove('hidden');
    document.getElementById('dtDate').textContent = formatDate(selectedDate);
    document.getElementById('dtTime').textContent = selectedTime;
  } else {
    dt.classList.add('hidden');
  }
}

function goToForm() {
  if (selectedTime) { showStep('form'); refreshAmount(); }
}

function goToSelect() {
  selectedTime = null;
  showStep('select');
  renderTimeSlots();
}

// 뒤로가기: 결제 → 옵션, 옵션 → 시간선택
function goBack() {
  if (currentStep === 'payment') showStep('form');
  else goToSelect();
}

// ===== 추가 옵션 / 금액 =====
const FACILITIES = ['빔프로젝터 / 스크린', '화이트보드', '기본 음향 시스템', '무료 Wi-Fi', '냉난방 · 정수기'];
const ADDONS = [
  { id: 'laptop', name: '노트북 대여', price: 10000 },
  { id: 'mic', name: '무선 마이크 추가', price: 5000 },
  { id: 'beam', name: '추가 빔프로젝터', price: 15000 },
  { id: 'snack', name: '다과 세트', price: 30000 },
];

function renderOptions() {
  const fl = document.getElementById('facilityList');
  if (fl) fl.innerHTML = FACILITIES.map((f) => `<li>${f}</li>`).join('');
  const al = document.getElementById('addonList');
  if (al) {
    al.innerHTML = ADDONS.map(
      (o) => `
      <label class="addon">
        <input type="checkbox" class="addon-cb" value="${o.id}" data-price="${o.price}" data-name="${o.name}">
        <span class="addon-name">${o.name}</span>
        <span class="addon-price">+₩${o.price.toLocaleString('ko-KR')}</span>
      </label>`
    ).join('');
  }
}

function getSelectedAddons() {
  return [...document.querySelectorAll('.addon-cb:checked')].map((cb) => ({
    id: cb.value, name: cb.dataset.name, price: +cb.dataset.price, qty: 1,
  }));
}

function computeAmounts() {
  const space = BNIData.getSpaces().find((s) => s.id === document.getElementById('serviceSelect').value);
  const dur = parseInt(document.getElementById('durationSelect').value) || 0;
  const base = space && dur ? Math.round((space.hourly_price * dur) / 60) : 0;
  const extra = getSelectedAddons().reduce((s, o) => s + o.price, 0);
  return { base, extra, total: base + extra, space };
}

function refreshAmount() {
  const { base, extra, total } = computeAmounts();
  const w = (n) => '₩' + n.toLocaleString('ko-KR');
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = w(v); };
  set('amtBase', base); set('amtExtra', extra); set('amtTotal', total);
}

// ===== 예약하기 → 결제 단계로 이동 =====
document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault(); // select 들의 required가 통과해야 여기 도달
  const { base, extra, total, space } = computeAmounts();
  const dur = parseInt(document.getElementById('durationSelect').value) || 60;
  const addons = getSelectedAddons();
  const w = (n) => '₩' + n.toLocaleString('ko-KR');

  document.getElementById('paySummary').innerHTML = `
    <div class="pay-row"><span>예약자</span><b>${userName}</b></div>
    <div class="pay-row"><span>공간</span><b>${space ? space.name : '-'}</b></div>
    <div class="pay-row"><span>일시</span><b>${formatDate(selectedDate)} ${selectedTime}</b></div>
    <div class="pay-row"><span>이용시간</span><b>${dur}분</b></div>
    <div class="pay-row"><span>대관료</span><b>${w(base)}</b></div>
    ${addons.length ? `<div class="pay-row"><span>추가 옵션</span><b>${addons.map((a) => a.name).join(', ')} (${w(extra)})</b></div>` : ''}
    <div class="pay-row total"><span>총 결제금액</span><b>${w(total)}</b></div>`;

  showStep('payment');
});

// ===== 토스페이먼츠 (테스트 모드) =====
// 본인 키로 교체하려면 아래 클라이언트 키만 바꾸면 됩니다.
const TOSS_CLIENT_KEY = 'test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const TOSS_METHOD = { '신용/체크카드': '카드', '계좌이체': '계좌이체' };
const PENDING_KEY = 'bni_pending_resv';

// 예약을 실제로 저장(결제 성공 후 또는 현장결제 시 호출)
function finalizeReservation(d) {
  const u = BNIData.upsertUser({ name: d.name, phone: d.phone, email: d.email });
  return BNIData.addReservation({
    user_id: u.id,
    space_id: d.space_id,
    date: d.date,
    time: d.time,
    duration: d.duration,
    memo: d.memo,
    email: d.email,
    extra: d.extra,
    options: d.options,
    payment_method: d.payment_method,
  });
}

// ===== 결제하기 → 토스 결제창 호출(또는 현장결제 즉시 확정) =====
document.getElementById('payBtn').addEventListener('click', () => {
  const spaceId = document.getElementById('serviceSelect').value;
  const duration = parseInt(document.getElementById('durationSelect').value) || 60;
  const memo = document.getElementById('memoInput').value || '';
  const email = document.getElementById('emailInput').value;
  const method = (document.querySelector('input[name="payMethod"]:checked') || {}).value || '신용/체크카드';
  const addons = getSelectedAddons();
  const { total } = computeAmounts();
  const space = findSpace(spaceId);

  // 결제 성공 후 예약을 만들기 위해 필요한 정보 묶음
  const pending = {
    name: userName, phone: userPhone, email,
    space_id: spaceId, date: selectedDate ? formatDateStr(selectedDate) : null,
    time: selectedTime || null, duration, memo, extra: addons.reduce((s, o) => s + o.price, 0),
    options: addons, payment_method: method,
  };

  // 현장 결제: 결제창 없이 즉시 예약 확정
  if (method === '현장결제') {
    finalizeReservation(pending);
    showStep('success');
    return;
  }

  // 온라인 결제: 토스 결제창 호출
  if (!window.TossPayments) {
    alert('결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  const orderId = 'resv_' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const orderName = (space ? space.name : '공간') + ' 대관' + (addons.length ? ` 외 ${addons.length}건` : '');
  const base = location.origin + location.pathname;

  const tossPayments = TossPayments(TOSS_CLIENT_KEY);
  tossPayments.requestPayment(TOSS_METHOD[method] || '카드', {
    amount: total,
    orderId: orderId,
    orderName: orderName,
    customerName: userName,
    customerEmail: email || undefined,
    successUrl: base + '?tossSuccess=1',
    failUrl: base + '?tossFail=1',
  }).catch((err) => {
    // 사용자가 결제창을 닫은 경우 등
    if (err && err.code !== 'USER_CANCEL') {
      alert('결제 요청 중 오류가 발생했습니다: ' + (err.message || ''));
    }
  });
});

// ===== 토스 결제 결과 처리 (리다이렉트 복귀 시) =====
function handleTossReturn() {
  const params = new URLSearchParams(location.search);
  const base = location.pathname;
  if (params.get('tossSuccess')) {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw) {
      const pend = JSON.parse(raw);
      finalizeReservation(pend);
      sessionStorage.removeItem(PENDING_KEY);
      // 완료 화면 표시를 위한 최소 상태 복원
      userName = pend.name; userPhone = pend.phone; selectedSpaceId = pend.space_id;
      if (pend.date) selectedDate = new Date(pend.date + 'T00:00:00');
      selectedTime = pend.time;
      history.replaceState({}, '', base);
      showPage('booking');
      showStep('success');
      return true;
    }
    history.replaceState({}, '', base);
  } else if (params.get('tossFail')) {
    history.replaceState({}, '', base);
    alert('결제가 취소되었거나 실패했습니다. 다시 시도해주세요.');
  }
  return false;
}

// ===== My Bookings Lookup =====
document.getElementById('lookupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('lookupPhone').value.replace(/-/g, '');
  if (!phone) return;

  const resultsEl = document.getElementById('lookupResults');
  const emptyEl = document.getElementById('lookupEmpty');
  const listEl = document.getElementById('lookupList');

  const user = BNIData.findUserByPhone(phone);
  const data = BNIData.getReservationsByPhone(phone);
  const spaces = BNIData.getSpaces();
  const spaceName = (id) => (spaces.find((s) => s.id === id) || {}).name || '-';

  if (!data || data.length === 0) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  listEl.innerHTML = data.map((b) => `
    <div class="my-booking-card">
      <div class="my-booking-row">
        <span class="my-booking-label">예약자</span>
        <span class="my-booking-value">${user ? user.name : '-'}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">예약번호</span>
        <span class="my-booking-value">${phone}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">공간</span>
        <span class="my-booking-value">${spaceName(b.space_id)}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">날짜</span>
        <span class="my-booking-value">${b.date || '-'}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">시간</span>
        <span class="my-booking-value">${b.time || '-'}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">이용시간</span>
        <span class="my-booking-value">${b.duration ? b.duration + '분' : '-'}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">상태</span>
        <span class="my-booking-value">${b.status || '-'}</span>
      </div>
      <div class="my-booking-row">
        <span class="my-booking-label">메모</span>
        <span class="my-booking-value">${b.memo || '-'}</span>
      </div>
      <div class="my-booking-time-stamp">예약일시: ${b.created_at ? new Date(b.created_at).toLocaleString('ko-KR') : '-'}</div>
    </div>
  `).join('');
});

// ===== Menu =====
function toggleMenu() {
  document.getElementById('menuDropdown').classList.toggle('hidden');
}
function closeMenu() {
  document.getElementById('menuDropdown').classList.add('hidden');
}
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.menu-wrapper');
  if (wrapper && !wrapper.contains(e.target)) closeMenu();
});

// ===== Init =====
document.getElementById('goToIntroBtn').addEventListener('click', () => {
  showPage('intro');
});
populateSpaces();
renderGuideSpaces();
renderOptions();
// 금액 실시간 반영
['serviceSelect', 'durationSelect'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => { refreshAmount(); updateBookingSpace(); });
});
const addonListEl = document.getElementById('addonList');
if (addonListEl) addonListEl.addEventListener('change', refreshAmount);
// 안내 페이지 공간 카드: 캐러셀 좌우 이동 + '이 공간 예약하기'
const guideSpacesEl = document.getElementById('guideSpaces');
if (guideSpacesEl) guideSpacesEl.addEventListener('click', (e) => {
  const nav = e.target.closest('.gs-car-nav');
  if (nav) {
    const car = nav.closest('.gs-carousel');
    const s = findSpace(car.dataset.id);
    const imgs = spaceImages(s);
    if (imgs.length < 2) return;
    const idx = ((+car.dataset.idx) + (+nav.dataset.dir) + imgs.length) % imgs.length;
    car.dataset.idx = idx;
    car.querySelector('.gs-car-img').style.backgroundImage = `url('${spaceImgUrl(imgs[idx], 500)}')`;
    car.querySelectorAll('.gs-car-dots .dot').forEach((d, k) => d.classList.toggle('active', k === idx));
    return;
  }
  const btn = e.target.closest('[data-select]');
  if (btn) selectSpace(btn.getAttribute('data-select'));
});

// 토스 결제 복귀 처리(성공 시 예약 확정 화면) → 아니면 안내 페이지부터
if (!handleTossReturn()) {
  showPage('guide');
}
