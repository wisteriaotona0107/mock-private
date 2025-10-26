// Data definitions
const sakes = [
  {
    id: "silent-01",
    name: "静の雫 純米大吟醸",
    type: "Junmai Daiginjo",
    aroma: "白い花、梨",
    taste: "繊細で長い余韻",
    temp: "10-12℃",
    tags: ["冷", "繊細"],
    story: "静かな夜に似合う、淡く澄んだ一杯。",
    region: "静流県 水音町",
    image: "assets/bottle-01.jpg"
  },
  {
    id: "silent-02",
    name: "墨霞 生酛純米",
    type: "Kimoto Junmai",
    aroma: "焙じ茶、熟した林檎",
    taste: "ふくよかで余韻に土の香り",
    temp: "常温",
    tags: ["常温", "旨"],
    story: "谷間で静かに熟す米と水。灯りを落とした夜に深みを添える酒。",
    region: "杜霞県 谷灯村",
    image: "assets/bottle-02.jpg"
  },
  {
    id: "silent-03",
    name: "月影の余韻 純米吟醸",
    type: "Junmai Ginjo",
    aroma: "月光柚子、白桃",
    taste: "柔らかな甘味と透明な酸",
    temp: "12-15℃",
    tags: ["冷", "香り"],
    story: "海霧が運ぶミネラルを閉じ込め、静かな余白を感じさせる一献。",
    region: "潮霞県 岸音町",
    image: "assets/bottle-03.jpg"
  }
];

const menuItems = [
  { name: "出汁巻き", note: "出汁の余韻と綺麗な旨味", pair: ["繊細", "旨"] },
  { name: "昆布〆白身", note: "潮の香りと澄んだ旨味", pair: ["冷", "香り"] },
  { name: "炙り山葵菜", note: "辛味の余韻が酒を進める", pair: ["旨", "香り"] },
  { name: "燻製胡桃", note: "煙が香る大人の甘苦さ", pair: ["常温", "熟"] }
];

const todayQuietnessLevels = ["静寂", "やや賑やか", "賑やか"];
const openHours = {
  Monday: "18:00 - 24:00",
  Tuesday: "18:00 - 24:00",
  Wednesday: "18:00 - 24:00",
  Thursday: "18:00 - 24:00",
  Friday: "18:00 - 26:00",
  Saturday: "18:00 - 26:00",
  Sunday: "休業"
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  activeModal: null,
  lastFocusedElement: null,
  selectedSake: null,
  quietIndex: Math.floor(Math.random() * todayQuietnessLevels.length)
};

const selectors = {
  menuToggle: document.getElementById("menuToggle"),
  nav: document.getElementById("primaryNav"),
  navClose: document.getElementById("navClose"),
  heroVideo: document.getElementById("heroVideo"),
  videoToggle: document.getElementById("videoToggle"),
  sakeCards: document.getElementById("sakeCards"),
  menuCards: document.getElementById("menuCards"),
  storyModal: document.getElementById("storyModal"),
  confirmationModal: document.getElementById("confirmationModal"),
  storyImage: document.getElementById("storyImage"),
  storyTitle: document.getElementById("storyTitle"),
  storyType: document.getElementById("storyType"),
  storyRegion: document.getElementById("storyRegion"),
  storyDescription: document.getElementById("storyDescription"),
  storyReserve: document.getElementById("storyReserve"),
  reservationForm: document.getElementById("reservationForm"),
  sakePreference: document.getElementById("sakePreference"),
  openHours: document.getElementById("openHours"),
  seatStatus: document.getElementById("seatStatus"),
  quietnessState: document.getElementById("quietnessState"),
  confirmationModalText: document.getElementById("confirmationTitle"),
  currentYear: document.getElementById("currentYear"),
  bgmToggle: document.getElementById("bgmToggle")
};

function setCurrentYear() {
  selectors.currentYear.textContent = new Date().getFullYear();
}

function renderSakes() {
  const fragment = document.createDocumentFragment();
  sakes.forEach((sake) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${sake.image}" alt="${sake.name}" loading="lazy" width="360" height="480">
      <div class="card-content">
        <header>
          <h3>${sake.name}</h3>
          <p>${sake.type}</p>
        </header>
        <p>${sake.aroma} / ${sake.taste}</p>
        <p class="card-temp">提供温度：${sake.temp}</p>
        <div class="card-tags">${sake.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <button class="btn secondary" data-sake="${sake.id}" aria-haspopup="dialog">物語を読む</button>
      </div>
    `;
    fragment.appendChild(card);
  });
  selectors.sakeCards.appendChild(fragment);
}

function renderMenu() {
  const fragment = document.createDocumentFragment();
  menuItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-content">
        <header>
          <h3>${item.name}</h3>
        </header>
        <p>${item.note}</p>
        <div class="card-tags">${item.pair.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
    `;
    fragment.appendChild(card);
  });
  selectors.menuCards.appendChild(fragment);
}

function renderOpenHours() {
  const entries = Object.entries(openHours).map(([day, hours]) => `${day}: ${hours}`);
  selectors.openHours.innerHTML = entries.join("<br>");
}

function rotateQuietnessIndicator() {
  selectors.quietnessState.textContent = todayQuietnessLevels[state.quietIndex];
  state.quietIndex = (state.quietIndex + 1) % todayQuietnessLevels.length;
}

let quietInterval = null;

function startQuietnessLoop() {
  if (quietInterval) {
    window.clearInterval(quietInterval);
  }
  rotateQuietnessIndicator();
  quietInterval = window.setInterval(rotateQuietnessIndicator, 8000);
}

function setupSeatStatus() {
  const statuses = ["余裕あり", "残りわずか", "静寂確約席のみ"];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  selectors.seatStatus.textContent = `今夜の空席状況：${statuses[randomIndex]}`;
}

function toggleNav(open) {
  const isOpen = open ?? selectors.nav.dataset.open === "true";
  const nextState = open ?? !isOpen;
  selectors.nav.dataset.open = String(nextState);
  selectors.nav.setAttribute("aria-hidden", String(!nextState));
  selectors.menuToggle.setAttribute("aria-expanded", String(nextState));
  document.body.classList.toggle("nav-open", nextState);
  if (nextState) {
    state.lastFocusedElement = document.activeElement;
    trapFocus(selectors.nav);
    const focusable = getFocusableElements(selectors.nav);
    focusable[0]?.focus();
  } else {
    releaseFocus();
    state.lastFocusedElement?.focus();
  }
}

function toggleModal(modal, open = false) {
  const nextState = open;
  if (nextState) {
    modal.dataset.open = "true";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    state.activeModal = modal;
    state.lastFocusedElement = document.activeElement;
    trapFocus(modal);
    const focusable = getFocusableElements(modal);
    focusable[0]?.focus();
  } else {
    modal.dataset.open = "false";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    releaseFocus();
    state.activeModal = null;
    state.lastFocusedElement?.focus();
  }
}

function openStoryModal(sakeId) {
  const sake = sakes.find((item) => item.id === sakeId);
  if (!sake) return;
  state.selectedSake = sake;
  selectors.storyImage.src = sake.image;
  selectors.storyImage.alt = `${sake.name}のボトル写真`;
  selectors.storyTitle.textContent = sake.name;
  selectors.storyType.textContent = `${sake.type} / 提供温度 ${sake.temp}`;
  selectors.storyRegion.textContent = sake.region;
  selectors.storyDescription.textContent = sake.story;
  toggleModal(selectors.storyModal, true);
}

function closeActiveModal() {
  if (state.activeModal) {
    toggleModal(state.activeModal, false);
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

let activeFocusTrap = null;

function trapFocus(container) {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;
  activeFocusTrap = (event) => {
    if (event.key !== "Tab") return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener("keydown", activeFocusTrap);
}

function releaseFocus() {
  if (!activeFocusTrap) return;
  const targets = [selectors.nav, selectors.storyModal, selectors.confirmationModal];
  targets.forEach((target) => target?.removeEventListener("keydown", activeFocusTrap));
  activeFocusTrap = null;
}

function handleNavClick(event) {
  if (event.target.matches("a[href^='#']")) {
    event.preventDefault();
    const targetId = event.target.getAttribute("href").slice(1);
    smoothScrollTo(targetId);
    toggleNav(false);
  }
}

function smoothScrollTo(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const options = { behavior: prefersReducedMotion.matches ? "auto" : "smooth" };
  element.scrollIntoView(options);
}

function handleSakeCardClick(event) {
  const button = event.target.closest("[data-sake]");
  if (!button) return;
  const sakeId = button.getAttribute("data-sake");
  openStoryModal(sakeId);
}

function handleModalInteraction(event) {
  if (event.target.matches("[data-close-modal]")) {
    closeActiveModal();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (selectors.nav.dataset.open === "true") {
      toggleNav(false);
    }
    if (state.activeModal) {
      closeActiveModal();
    }
  }
}

function toggleVideoPlayback() {
  if (!selectors.heroVideo) return;
  if (selectors.heroVideo.paused) {
    selectors.heroVideo.play();
    selectors.videoToggle.textContent = "一時停止";
    selectors.videoToggle.setAttribute("aria-pressed", "true");
  } else {
    selectors.heroVideo.pause();
    selectors.videoToggle.textContent = "再生";
    selectors.videoToggle.setAttribute("aria-pressed", "false");
  }
}

function initializeVideo() {
  if (prefersReducedMotion.matches) {
    selectors.heroVideo.pause();
    selectors.videoToggle.textContent = "再生";
    selectors.videoToggle.setAttribute("aria-pressed", "false");
  }
  selectors.videoToggle.addEventListener("click", toggleVideoPlayback);
}

function setupReducedMotionListener() {
  const listener = (event) => {
    if (event.matches) {
      selectors.heroVideo.pause();
      selectors.videoToggle.textContent = "再生";
      selectors.videoToggle.setAttribute("aria-pressed", "false");
    }
  };
  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", listener);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(listener);
  }
}

function populateFormFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem("seihteki-reservation"));
    if (!saved) return;
    if (saved.guestName) selectors.reservationForm.guestName.value = saved.guestName;
    if (saved.partySize) selectors.reservationForm.partySize.value = saved.partySize;
    if (saved.sakePreference) selectors.sakePreference.value = saved.sakePreference;
  } catch (error) {
    console.error("Failed to load reservation data", error);
  }
}

function storeReservation(values) {
  const payload = {
    guestName: values.guestName || "",
    partySize: values.partySize || "",
    sakePreference: values.sakePreference || ""
  };
  localStorage.setItem("seihteki-reservation", JSON.stringify(payload));
}

function validateForm(form) {
  const invalidFields = [];
  const date = form.reservationDate;
  const time = form.reservationTime;
  const party = form.partySize;

  if (!date.value) invalidFields.push(date);
  if (!time.value) invalidFields.push(time);
  if (!party.value || Number(party.value) <= 0) invalidFields.push(party);

  if (invalidFields.length > 0) {
    invalidFields[0].focus();
    return false;
  }
  return true;
}

function handleReservationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return;
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  console.log("Reservation submitted", values);
  storeReservation(values);
  toggleModal(selectors.confirmationModal, true);
  form.reset();
  populateFormFromStorage();
}

function handleStoryReserve() {
  if (!state.selectedSake) return;
  selectors.sakePreference.value = state.selectedSake.name;
  closeActiveModal();
  smoothScrollTo("reservation");
  selectors.sakePreference.focus();
}

function initializeIntersectionObserver() {
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((element) => observer.observe(element));
}

function setupNav() {
  selectors.menuToggle.addEventListener("click", () => toggleNav());
  selectors.navClose.addEventListener("click", () => toggleNav(false));
  selectors.nav.addEventListener("click", handleNavClick);
}

function setupModals() {
  document.addEventListener("click", handleModalInteraction);
  selectors.storyReserve.addEventListener("click", handleStoryReserve);
}

function setupSakeCards() {
  selectors.sakeCards.addEventListener("click", handleSakeCardClick);
}

function setupReservationForm() {
  selectors.reservationForm.addEventListener("submit", handleReservationSubmit);
}

function setupBgmToggle() {
  selectors.bgmToggle.addEventListener("click", () => {
    const pressed = selectors.bgmToggle.getAttribute("aria-pressed") === "true";
    selectors.bgmToggle.setAttribute("aria-pressed", String(!pressed));
    selectors.bgmToggle.textContent = pressed ? "BGM 停止中" : "BGM 再生中";
  });
}

function setupQuietness() {
  startQuietnessLoop();
  window.addEventListener("blur", () => {
    if (quietInterval) {
      clearInterval(quietInterval);
      quietInterval = null;
    }
  });
  window.addEventListener("focus", () => {
    if (!quietInterval) {
      startQuietnessLoop();
    }
  });
}

function setupVideoAccessibility() {
  selectors.heroVideo.addEventListener("loadeddata", () => {
    if (prefersReducedMotion.matches) {
      selectors.heroVideo.pause();
    }
  });
}

function initSeatStatus() {
  setupSeatStatus();
}

function initEventListeners() {
  document.addEventListener("keydown", handleKeydown);
  setupNav();
  setupModals();
  setupSakeCards();
  setupReservationForm();
  initializeVideo();
  setupReducedMotionListener();
  setupBgmToggle();
  setupQuietness();
  setupVideoAccessibility();
}

function init() {
  setCurrentYear();
  renderSakes();
  renderMenu();
  renderOpenHours();
  initSeatStatus();
  populateFormFromStorage();
  initializeIntersectionObserver();
  initEventListeners();
}

document.addEventListener("DOMContentLoaded", init);
