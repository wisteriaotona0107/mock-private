(() => {
  const form = document.getElementById("estimateForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const result = document.getElementById("result");
  const estimateRange = document.getElementById("estimateRange");
  const estimateSummary = document.getElementById("estimateSummary");

  const fieldIds = ["workType", "scale", "buildingAge", "timing", "contact"];
  const storageKey = "estimateFormData";

  const basePrices = {
    外壁: { min: 45, max: 70 },
    屋根: { min: 40, max: 65 },
    水回り: { min: 35, max: 55 },
    内装: { min: 30, max: 50 },
    増改築: { min: 80, max: 130 },
  };

  const scaleFactor = { 小: 0.9, 中: 1.2, 大: 1.6 };

  let currentStep = 1;

  function saveData() {
    const data = fieldIds.reduce((acc, id) => {
      const element = document.getElementById(id);
      acc[id] = element ? element.value : "";
      return acc;
    }, {});
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function loadData() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && typeof parsed[id] === "string") {
          el.value = parsed[id];
        }
      });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  function ageFactor(age) {
    if (age <= 10) return 1;
    if (age <= 20) return 1.12;
    if (age <= 30) return 1.25;
    return 1.4;
  }

  function clearErrors() {
    ["errorStep1", "errorStep2", "errorStep3"].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.textContent = "";
    });
  }

  function validateStep(step) {
    clearErrors();

    if (step === 1) {
      const workType = document.getElementById("workType").value;
      if (!workType) {
        document.getElementById("errorStep1").textContent = "工事タイプを選択してください。";
        return false;
      }
      return true;
    }

    if (step === 2) {
      const scale = document.getElementById("scale").value;
      const buildingAge = Number(document.getElementById("buildingAge").value);
      if (!scale) {
        document.getElementById("errorStep2").textContent = "工事規模を選択してください。";
        return false;
      }
      if (!Number.isFinite(buildingAge) || buildingAge < 0 || buildingAge > 120) {
        document.getElementById("errorStep2").textContent = "築年数は0〜120の範囲で入力してください。";
        return false;
      }
      return true;
    }

    const timing = document.getElementById("timing").value;
    const contact = document.getElementById("contact").value.trim();
    if (!timing) {
      document.getElementById("errorStep3").textContent = "希望時期を選択してください。";
      return false;
    }
    if (contact.length < 6) {
      document.getElementById("errorStep3").textContent = "連絡先を正しく入力してください。";
      return false;
    }
    return true;
  }

  function updateStepUI() {
    steps.forEach((stepEl, index) => {
      const stepNo = index + 1;
      const active = stepNo === currentStep;
      stepEl.hidden = !active;
      stepEl.classList.toggle("is-active", active);
    });

    prevBtn.disabled = currentStep === 1;
    nextBtn.hidden = currentStep === steps.length;
    submitBtn.hidden = currentStep !== steps.length;

    const progressPercent = (currentStep / steps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressText.textContent = `Step ${currentStep} / ${steps.length}`;
  }

  function calculateEstimate() {
    const workType = document.getElementById("workType").value;
    const scale = document.getElementById("scale").value;
    const buildingAge = Number(document.getElementById("buildingAge").value);
    const timing = document.getElementById("timing").value;

    const base = basePrices[workType];
    const factor = (scaleFactor[scale] || 1) * ageFactor(buildingAge);
    const min = Math.round(base.min * factor);
    const max = Math.round(base.max * factor);

    estimateRange.textContent = `${min}〜${max}万円`;
    estimateSummary.textContent = `${workType}・${scale}規模・築${buildingAge}年を想定した概算です。希望時期は「${timing}」として受付しました。`; 
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });

    const finalCta = document.getElementById("final-cta");
    finalCta.classList.add("highlight");
    setTimeout(() => finalCta.classList.remove("highlight"), 1800);
  }

  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep -= 1;
      updateStepUI();
      clearErrors();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    saveData();
    currentStep += 1;
    updateStepUI();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(currentStep)) return;
    saveData();
    calculateEstimate();
  });

  form.addEventListener("input", saveData);
  form.addEventListener("change", saveData);

  loadData();
  updateStepUI();
})();
