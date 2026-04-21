/* ===== script.js — index page (纯静态版) ===== */

const MONTH_DAYS = [0,31,29,31,30,31,30,31,31,30,31,30,31];

const HOUR_LABELS = [
  '子夜','凌晨','凌晨','黎明','黎明','清晨',
  '清晨','早晨','早晨','上午','上午','午前',
  '正午','午后','午后','下午','下午','傍晚',
  '傍晚','入夜','夜里','夜间','深夜','深夜'
];

const selMonth   = document.getElementById('selMonth');
const selDay     = document.getElementById('selDay');
const hourGrid   = document.getElementById('hourGrid');
const hiddenHour = document.getElementById('hiddenHour');
const submitBtn  = document.getElementById('submitBtn');
const matchForm  = document.getElementById('matchForm');

// ─── 时辰按钮 ─────────────────────────────────────────────────────────────────
(function buildHourGrid() {
  for (let h = 0; h < 24; h++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hour-btn';
    btn.dataset.hour = h;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.innerHTML = `<span class="num">${String(h).padStart(2,'0')}</span>${HOUR_LABELS[h]}`;
    btn.addEventListener('click', () => selectHour(h));
    hourGrid.appendChild(btn);
  }
})();

function selectHour(h) {
  document.querySelectorAll('.hour-btn').forEach(b => {
    const active = parseInt(b.dataset.hour) === h;
    b.classList.toggle('active', active);
    b.setAttribute('aria-checked', active ? 'true' : 'false');
  });
  hiddenHour.value = h;
  checkFormReady();
}

// ─── 日期下拉 ─────────────────────────────────────────────────────────────────
selMonth.addEventListener('change', () => {
  const m = parseInt(selMonth.value);
  selDay.innerHTML = '<option value="" disabled selected>— 日 —</option>';
  if (!m) return;
  for (let d = 1; d <= MONTH_DAYS[m]; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = `${d} 日`;
    selDay.appendChild(opt);
  }
  selDay.disabled = false;
  checkFormReady();
});

selDay.addEventListener('change', checkFormReady);

function checkFormReady() {
  submitBtn.disabled = !(selMonth.value && selDay.value && hiddenHour.value !== '');
}

// ─── 提交跳转 ─────────────────────────────────────────────────────────────────
matchForm.addEventListener('submit', e => {
  e.preventDefault();
  const month = selMonth.value;
  const day   = selDay.value;
  const hour  = hiddenHour.value;
  if (!month || !day || hour === '') return;
  window.location.href = `result.html?month=${month}&day=${day}&hour=${hour}`;
});