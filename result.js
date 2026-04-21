/* ===== result.js — 纯静态版 ===== */

// ── Google Sheets 记录地址（部署 Apps Script 后填入） ──────────────────────────
// 格式: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyCy_THpzMOnQ88_kM6x3if5Ys2DrTAL7CplqTyQuVvZM_e_cn1KfaHTawkQmBvS6NP/exec';

const HOUR_LABELS = [
  '子夜','凌晨','凌晨','黎明','黎明','清晨',
  '清晨','早晨','早晨','上午','上午','午前',
  '正午','午后','午后','下午','下午','傍晚',
  '傍晚','长夜','夜里','夜间','深夜','深夜'
];

const ZODIAC = [
  { name:'摩羯座', end:[1,19]  }, { name:'水瓶座', end:[2,18]  },
  { name:'双鱼座', end:[3,20]  }, { name:'白羊座', end:[4,19]  },
  { name:'金牛座', end:[5,20]  }, { name:'双子座', end:[6,21]  },
  { name:'巨蟹座', end:[7,22]  }, { name:'狮子座', end:[8,22]  },
  { name:'处女座', end:[9,22]  }, { name:'天秤座', end:[10,23] },
  { name:'天蝎座', end:[11,22] }, { name:'射手座', end:[12,21] },
  { name:'摩羯座', end:[12,31] }
];

const SHICHEN = [
  '子时','子时','丑时','丑时','寅时','寅时',
  '卯时','卯时','辰时','辰时','巳时','巳时',
  '午时','午时','未时','未时','申时','申时',
  '酉时','酉时','戌时','戌时','亥时','亥时'
];

// ── 哈希函数（与后端相同，保证确定性）──────────────────────────────────────────
function getItemIndex(month, day, hour) {
  let h = month * 100000 + day * 1000 + hour;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return Math.abs(h) % ITEMS.length;
}

function getZodiac(month, day) {
  for (const s of ZODIAC) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.name;
  }
  return '摩羯座';
}

// ── Pixabay 图片（按关键词搜索真实摄影图）────────────────────────────────────────
const PIXABAY_KEY = '55529302-ccc5cccb5afef458d8ae26e66';

async function imageUrl(keyword) {
  const q = encodeURIComponent(keyword);
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&per_page=5&safesearch=true&orientation=horizontal`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].webformatURL;
    }
  } catch(e) {}
  return null;
}

// ── 主逻辑 ────────────────────────────────────────────────────────────────────
(async function main() {
  const params = new URLSearchParams(location.search);
  const month  = parseInt(params.get('month'));
  const day    = parseInt(params.get('day'));
  const hour   = parseInt(params.get('hour'));
  const area   = document.getElementById('resultArea');

  if (isNaN(month) || isNaN(day) || isNaN(hour)) {
    showError(area, '参数有误，请返回重新选择生日。');
    return;
  }

  const item    = ITEMS[getItemIndex(month, day, hour)];
  const zodiac  = getZodiac(month, day);
  const shichen = SHICHEN[hour];
  const imgSrc  = await imageUrl(item.keyword);  // 等待 Pixabay 返回真实图片URL

  renderResult(area, { item, month, day, hour, zodiac, shichen, imgSrc });

  // 记录到 Google Sheets（不影响页面显示）
  if (SHEETS_URL) logToSheets({ month, day, hour, zodiac, shichen, itemName: item.name, itemCategory: item.category });
})();

// ── 渲染结果 ──────────────────────────────────────────────────────────────────
function renderResult(container, { item, month, day, hour, zodiac, shichen, imgSrc }) {
  const dateTag = `${month} 月 ${day} 日 · ${String(hour).padStart(2,'0')}:00 ${HOUR_LABELS[hour]}`;

  container.innerHTML = `
    <div class="result-card-wrap">
      <div class="result-hero">
        <img id="heroImg" src="${imgSrc}" alt="${item.name}" />
        <div class="result-hero__placeholder" id="heroPlaceholder">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="12" width="48" height="40" rx="4" stroke="#e8829a" stroke-width="2"/>
            <circle cx="24" cy="26" r="6" stroke="#e8829a" stroke-width="2"/>
            <path d="M8 42 L20 30 L32 40 L42 28 L56 44" stroke="#e8829a" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="result-category-badge">${item.category}</span>
      </div>
      <div class="result-meta">
        <p class="result-date-tag">${dateTag} · ${zodiac} · ${shichen}</p>
        <h2 class="result-item-name">${item.name}</h2>
        <p class="result-desc">${item.description}</p>
        <div class="result-share-row">
          <a href="index.html" class="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            重新查询
          </a>
        </div>
      </div>
      <p class="img-credit">图片来源 <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></p>
    </div>
  `;

  // 图片加载成功时隐藏占位符
  const img  = document.getElementById('heroImg');
  const ph   = document.getElementById('heroPlaceholder');
  img.style.opacity = '0';
  img.addEventListener('load',  () => { img.style.opacity = '1'; ph.style.display = 'none'; });
  img.addEventListener('error', () => { img.style.display = 'none'; ph.style.display = 'flex'; });

  document.title = `${item.name} · Birthday Match`;
}

// ── 错误状态 ──────────────────────────────────────────────────────────────────
function showError(container, msg) {
  container.innerHTML = `
    <div class="error-box">
      <p>${msg}</p><br/>
      <a href="index.html" class="btn-back" style="display:inline-flex;margin:0 auto;">← 返回首页</a>
    </div>`;
}

// ── Google Sheets 记录 ────────────────────────────────────────────────────────
function logToSheets(data) {
  const now = new Date().toLocaleString('zh-CN');
  const params = new URLSearchParams({
    time:     now,
    month:    data.month,
    day:      data.day,
    hour:     data.hour + '点',
    zodiac:   data.zodiac,
    shichen:  data.shichen,
    item:     data.itemName,
    category: data.itemCategory
  });
  // 用 no-cors 静默发送，无需返回值
  fetch(SHEETS_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' })
    .catch(() => {}); // 静默失败
}