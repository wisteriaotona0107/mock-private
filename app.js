const safe = (v, fallback = "") => (v === undefined || v === null || v === "" ? fallback : v);

fetch("data.json")
  .then((r) => r.json())
  .then((data) => init(data))
  .catch(() => init({}));

function init(data) {
  renderNav(data.nav || []);
  renderHero(data.hero || {});
  renderFeatures(data.features || []);
  renderCourses(data.courses || []);
  renderPanels(data.panels || []);
  renderScenes(data.scenes || []);
  renderStore(data.store || {});
  renderFaq(data.faq || []);
  renderDiagnosis();
  wireInteractions();
}

function renderNav(items) {
  const nav = document.getElementById("mainNav");
  nav.innerHTML = items.map((i) => `<a href="#">${i}</a>`).join("");
}
function renderHero(h) {
  const el = document.getElementById("hero");
  el.style.backgroundImage = `url('${safe(h.image, "assets/hero/beer-garden-hero.jpg")}')`;
  el.innerHTML = `<div class="hero-inner"><div class="badge">${safe(h.period, "期間限定")}</div><div>${safe(h.eyebrow, "SUMMER BEER GARDEN")}</div><h1>${safe(h.title, "屋外ビアガーデン").replace(/\n/g, "<br>")}</h1><p>${safe(h.desc, "")}</p><div class="btn-row"><button class="btn primary">${safe(h.ctaPrimary, "予約する")}</button><button class="btn secondary">${safe(h.ctaSecondary, "空席確認")}</button></div></div>`;
}
function renderFeatures(list) {
  const el = document.getElementById("features");
  el.innerHTML = `<h2>3つのこだわり</h2><div class="cards">${list.map((f) => `<article class='info-box'><div class='card-body'><h3>${safe(f.title, "見出し")}</h3><p>${safe(f.text, "説明")}</p></div></article>`).join("")}</div>`;
}
function renderCourses(list) {
  const el = document.getElementById("courses");
  const cards = list.length ? list : [{ name: "コース準備中", price: "", desc: "", image: "assets/food/meat-grill.jpg" }];
  el.innerHTML = `<div class='section-head'><h2>おすすめコース</h2></div><div class='cards'>${cards.map((c) => `<article class='course-card'><img src='${safe(c.image, "assets/food/meat-grill.jpg")}' alt='${safe(c.name, "course")}'><div class='card-body'><h3>${safe(c.name, "")}</h3><strong>${safe(c.price, "")}</strong><p>${safe(c.desc, "")}</p><button class='btn'>詳細を見る</button></div></article>`).join("")}</div>`;
}
function renderPanels(list) {
  const el = document.getElementById("splitPanels");
  el.innerHTML = `<div class='cards'>${list.map((p) => `<article class='panel dark'><img src='${safe(p.image)}' alt='${safe(p.title)}'><div class='card-body'><h3>${safe(p.title)}</h3><p>${safe(p.subtitle)}</p><ul>${(p.items || []).map((it) => `<li>${it}</li>`).join("")}</ul><a href='#'>${safe(p.link)}</a></div></article>`).join("")}</div>`;
}
function renderScenes(list) {
  const el = document.getElementById("scenes");
  el.innerHTML = `<h2>こんなシーンにおすすめ！</h2><div class='cards'>${list.map((s) => `<article class='scene-card'><img src='${safe(s.image)}' alt='${safe(s.title)}'><div class='card-body'><h3>${safe(s.title)}</h3><p>${safe(s.text)}</p></div></article>`).join("")}</div><div class='hero-inner' style='padding:20px;background:#111;color:#fff;border-radius:12px;margin-top:16px;'><h2>夏の思い出を、ここでつくろう。</h2><div class='btn-row'><button class='btn primary'>今すぐ予約する</button><button class='btn secondary'>空席を確認する</button></div></div>`;
}
function renderStore(s) {
  document.getElementById("storeInfo").innerHTML = `<div class='info-grid'><article class='info-box'><div class='card-body'><h3>営業時間</h3><p>${safe(s.hours, "-")}</p></div></article><article class='info-box'><div class='card-body'><h3>アクセス</h3><p>${safe(s.access, "-")}</p></div></article><article class='info-box'><div class='card-body'><h3>ご予約・お問い合わせ</h3><p>${safe(s.tel, "-")}</p></div></article><article class='info-box'><div class='card-body'><h3>SNS</h3><p>Instagram / X / LINE</p></div></article></div>`;
}
function renderFaq(list) {
  document.getElementById("faq").innerHTML = `<h2>FAQ</h2>${list.map((f) => `<details class='faq-item'><summary>${safe(f.q, "質問")}</summary><p>${safe(f.a, "回答")}</p></details>`).join("")}`;
  document.getElementById("footer").innerHTML = `<small>© THE SUMMER TERRACE</small>`;
}
function renderDiagnosis() {
  const d = document.getElementById("diagnosis");
  d.innerHTML = `<h2>あなたに合う 肉料理 × 一杯 診断</h2>
  <div class='diag-card'><h3>Q1 / 5</h3><p>味はしっかり濃い方が好きですか？</p><div class='diag-btns'><button class='yes'>Yes</button><button>No</button></div></div>
  <div class='diag-card'><h3>Q2 / 5</h3><p>脂ののったジューシー系は好きですか？</p><div class='diag-btns'><button class='yes'>Yes</button><button>No</button></div></div>
  <div class='diag-card'><h3>診断結果</h3><p>あなたのタイプ：FMDS 肉宴マスター型</p><div class='diag-food'><img src='assets/food/meat-grill.jpg' alt='result'></div><button class='btn primary' style='width:100%;margin-top:10px;'>この組み合わせで予約する</button></div>`;
}
function wireInteractions() {
  const toggle = document.getElementById("sidebarToggle");
  const aside = document.getElementById("diagnosis");
  toggle?.addEventListener("click", () => aside.classList.toggle("open"));
}
