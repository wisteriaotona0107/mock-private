const questions = [
  {
    text: "夜に落ち着く場所は？",
    options: [
      { label: "暖色の灯りがある小さな店", score: { aroma: 1, temperature: 1, mood: -1, body: 1 } },
      { label: "風が抜けるテラスや明るい席", score: { aroma: -1, temperature: -1, mood: 1, body: -1 } }
    ]
  },
  {
    text: "料理で惹かれるのは？",
    options: [
      { label: "炭火、煮込み、味噌、脂の旨み", score: { body: 1, temperature: 1, aroma: 1, mood: -1 } },
      { label: "塩、刺身、出汁、軽い前菜", score: { body: -1, temperature: -1, aroma: -1, mood: 1 } }
    ]
  },
  {
    text: "お酒の香りは？",
    options: [
      { label: "個性がある方が記憶に残って好き", score: { aroma: 1, body: 1, mood: -1, temperature: 1 } },
      { label: "食事を邪魔しない穏やかさが好き", score: { aroma: -1, body: -1, mood: 1, temperature: -1 } }
    ]
  },
  {
    text: "飲み方として惹かれるのは？",
    options: [
      { label: "お湯割り、前割り、ぬる燗", score: { temperature: 1, body: 1, mood: -1, aroma: 1 } },
      { label: "ロック、ソーダ、水割り", score: { temperature: -1, body: -1, mood: 1, aroma: -1 } }
    ]
  },
  {
    text: "飲み会の後半は？",
    options: [
      { label: "もう少し語りたい", score: { mood: 1, aroma: 1, body: 1, temperature: 1 } },
      { label: "静かに余韻へ入りたい", score: { mood: -1, aroma: -1, body: -1, temperature: -1 } }
    ]
  },
  {
    text: "味わいの好みは？",
    options: [
      { label: "しっかり、濃い、深い", score: { body: 1, aroma: 1, temperature: 1, mood: -1 } },
      { label: "すっきり、軽い、爽やか", score: { body: -1, aroma: -1, temperature: -1, mood: 1 } }
    ]
  },
  {
    text: "旅先で飲むなら？",
    options: [
      { label: "土地のクセがある酒", score: { aroma: 1, body: 1, mood: -1, temperature: 1 } },
      { label: "誰とでも合わせやすい酒", score: { aroma: -1, body: -1, mood: 1, temperature: -1 } }
    ]
  },
  {
    text: "食事との関係は？",
    options: [
      { label: "酒そのものも主役であってほしい", score: { aroma: 1, body: 1, mood: -1, temperature: 1 } },
      { label: "料理を引き立てる酒がいい", score: { aroma: -1, body: -1, mood: 1, temperature: -1 } }
    ]
  }
];

const resultTypes = [
  { name: "焚火芋焼酎型", category: "芋焼酎", copy: "深い香りを湯気でほどいて、夜の対話をゆっくり育てるタイプ。", profile: "香り高め / 温度は温 / 没入寄り / 重厚", drink: "お湯割り、前割り燗", food: "炭火焼、豚の角煮、味噌料理", brands: "黒霧島、伊佐美、村尾系", comment: "湯気の奥から立つ香りを、少し低めの温度で長く楽しんで。", match: s => s.aroma >= 0 && s.temperature >= 0 && s.mood < 0 && s.body >= 0 },
  { name: "香ばし麦ロック型", category: "麦焼酎", copy: "香ばしさはありつつ軽快。会話の流れを止めないスマートな一杯。", profile: "香り中庸 / 冷寄り / 会話寄り / 軽快", drink: "ロック、ソーダ", food: "焼き鳥、唐揚げ、塩味料理", brands: "いいちこ、中々、兼八系", comment: "最初の一杯はソーダ、後半はロックで温度差を楽しむのがおすすめ。", match: s => s.body <= 0 && s.temperature <= 0 && s.mood >= 0 && s.aroma >= 0 },
  { name: "静謐米焼酎型", category: "米焼酎", copy: "透明感のある香りと余韻。料理の輪郭を静かに引き立てるタイプ。", profile: "香り穏やか / 温冷どちらも可 / 没入寄り / 軽やか", drink: "水割り、ぬる燗、少量ストレート", food: "刺身、出汁、白身魚、米料理", brands: "鳥飼、白岳しろ、球磨焼酎系", comment: "一口ごとに香りの層を感じるよう、細身グラスでゆっくり。", match: s => s.aroma < 0 && s.body <= 0 && s.mood < 0 },
  { name: "南風黒糖ソーダ型", category: "黒糖焼酎", copy: "やわらかな甘みを風のように。軽快で親しみやすい夜向け。", profile: "香りやや華やか / 冷寄り / 会話寄り / 軽快", drink: "ソーダ、ロック", food: "鶏料理、スパイス料理、柑橘系", brands: "れんと、里の曙、朝日系", comment: "氷は大きめを選び、香りを開かせるようにひと混ぜ。", match: s => s.temperature <= 0 && s.mood >= 0 && s.body <= 0 },
  { name: "深夜泡盛型", category: "泡盛", copy: "芯の強さと余韻の長さ。深夜にじわっと効いてくる存在感。", profile: "香り個性派 / 温冷どちらも可 / 没入寄り / 重厚", drink: "ロック、ストレート、水割り", food: "ラフテー、豆腐よう、脂のある料理", brands: "瑞泉、菊之露、久米仙系", comment: "チェイサーを添えて、余韻をひとつずつ確かめるのが吉。", match: s => s.aroma >= 0 && s.body >= 0 && s.mood < 0 },
  { name: "乾いたそば焼酎型", category: "そば焼酎", copy: "キレのよさと静かな香ばしさ。食中酒として頼れるバランス型。", profile: "香り控えめ / 冷寄り / 会話寄り / 中軽量", drink: "ロック、水割り", food: "蕎麦、天ぷら、山菜、和惣菜", brands: "雲海、そば雲海系", comment: "料理の温度に合わせて、割り材の比率を少しだけ調整してみて。", match: _ => true }
];

const state = { index: 0, scores: { aroma: 0, temperature: 0, mood: 0, body: 0 } };

const screens = {
  hero: document.getElementById("hero-screen"),
  question: document.getElementById("question-screen"),
  result: document.getElementById("result-screen")
};

const questionText = document.getElementById("question-text");
const optionA = document.getElementById("option-a");
const optionB = document.getElementById("option-b");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");

function showScreen(key) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[key].classList.add("active");
}

function renderQuestion() {
  const q = questions[state.index];
  questionText.textContent = q.text;
  optionA.textContent = q.options[0].label;
  optionB.textContent = q.options[1].label;
  progressLabel.textContent = `Question ${state.index + 1} / ${questions.length}`;
  progressBar.style.width = `${((state.index + 1) / questions.length) * 100}%`;
}

function applyScore(score) {
  Object.entries(score).forEach(([axis, delta]) => {
    state.scores[axis] += delta;
  });
}

function pickResult() {
  return resultTypes.find((r) => r.match(state.scores));
}

function renderResult() {
  const result = pickResult();
  document.getElementById("result-name").textContent = result.name;
  document.getElementById("result-copy").textContent = result.copy;
  document.getElementById("result-category").textContent = result.category;
  document.getElementById("result-profile").textContent = result.profile;
  document.getElementById("result-drink").textContent = result.drink;
  document.getElementById("result-food").textContent = result.food;
  document.getElementById("result-brands").textContent = result.brands;
  document.getElementById("result-comment").textContent = result.comment;
}

function handleAnswer(optionIndex) {
  applyScore(questions[state.index].options[optionIndex].score);
  state.index += 1;
  if (state.index >= questions.length) {
    renderResult();
    showScreen("result");
    return;
  }
  renderQuestion();
}

document.getElementById("start-btn").addEventListener("click", () => {
  showScreen("question");
  renderQuestion();
});

optionA.addEventListener("click", () => handleAnswer(0));
optionB.addEventListener("click", () => handleAnswer(1));

document.getElementById("retry-btn").addEventListener("click", () => {
  state.index = 0;
  state.scores = { aroma: 0, temperature: 0, mood: 0, body: 0 };
  showScreen("hero");
});
