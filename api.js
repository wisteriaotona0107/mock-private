// 疑似API層。ブラウザ内メモリと localStorage を利用し、後からサーバーAPIへ差し替えやすい構成。
const STORAGE_KEY = 'mock-admin-cache-v1';

function nowIso() {
  return new Date().toISOString();
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('localStorage 読み込みに失敗しました', e);
    return null;
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage への保存に失敗しました', e);
  }
}

async function fetchJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('fetch 失敗', path, e);
    return null;
  }
}

class DataStore {
  constructor() {
    this.state = {
      products: [],
      categories: [],
      announcements: [],
      check_templates: [],
      daily_checks: [],
      meta: { next_ids: {}, daily_check_month: '' }
    };
  }

  async loadAll() {
    const cached = loadFromStorage();
    if (cached) {
      this.state = cached;
      return this.state;
    }
    const [meta, products, categories, announcements, templates] = await Promise.all([
      fetchJson('data/meta.json'),
      fetchJson('data/products.json'),
      fetchJson('data/categories.json'),
      fetchJson('data/announcements.json'),
      fetchJson('data/check_templates.json')
    ]);
    this.state.meta = meta || { next_ids: {}, daily_check_month: '' };
    this.state.products = products || [];
    this.state.categories = categories || [];
    this.state.announcements = announcements || [];
    this.state.check_templates = templates || [];

    const month = this.state.meta.daily_check_month || new Date().toISOString().slice(0,7).replace('-','');
    const dailyChecks = await fetchJson(`data/daily_checks_${month}.json`);
    this.state.daily_checks = dailyChecks || [];
    saveToStorage(this.state);
    return this.state;
  }

  persist() {
    saveToStorage(this.state);
  }

  // 共通: ID 採番
  nextId(key) {
    if (!this.state.meta.next_ids[key]) this.state.meta.next_ids[key] = 1;
    const id = this.state.meta.next_ids[key];
    this.state.meta.next_ids[key] += 1;
    return id;
  }

  // エクスポート
  exportJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importJson(file) {
    const text = await file.text();
    return JSON.parse(text);
  }

  // Products
  listProducts(filter = {}) {
    const { q, category_id, activeOnly } = filter;
    let list = [...this.state.products];
    if (q) list = list.filter(p => (p.name || '').includes(q) || (p.desc || '').includes(q));
    if (category_id) list = list.filter(p => String(p.category_id) === String(category_id));
    if (activeOnly) list = list.filter(p => p.is_active !== false);
    return list.sort((a,b)=> (a.sort_order||0) - (b.sort_order||0));
  }

  getProduct(id) {
    return this.state.products.find(p => Number(p.id) === Number(id));
  }

  createProduct(input) {
    const id = this.nextId('products');
    const item = { ...input, id, updated_at: nowIso() };
    this.state.products.push(item);
    this.persist();
    return item;
  }

  updateProduct(id, patch) {
    const idx = this.state.products.findIndex(p => Number(p.id) === Number(id));
    if (idx === -1) return null;
    this.state.products[idx] = { ...this.state.products[idx], ...patch, updated_at: nowIso() };
    this.persist();
    return this.state.products[idx];
  }

  toggleProductActive(id, is_active) {
    return this.updateProduct(id, { is_active });
  }

  // Categories
  listCategories() { return [...this.state.categories].sort((a,b)=> (a.sort_order||0)-(b.sort_order||0)); }
  getCategory(id) { return this.state.categories.find(c => Number(c.id) === Number(id)); }
  createCategory(input) {
    const id = this.nextId('categories');
    const item = { ...input, id, updated_at: nowIso() };
    this.state.categories.push(item);
    this.persist();
    return item;
  }
  updateCategory(id, patch) {
    const idx = this.state.categories.findIndex(c => Number(c.id) === Number(id));
    if (idx === -1) return null;
    this.state.categories[idx] = { ...this.state.categories[idx], ...patch, updated_at: nowIso() };
    this.persist();
    return this.state.categories[idx];
  }

  // Announcements
  listAnnouncements() { return [...this.state.announcements].sort((a,b)=> (b.updated_at||'').localeCompare(a.updated_at||'')); }
  getAnnouncement(id) { return this.state.announcements.find(a => Number(a.id) === Number(id)); }
  createAnnouncement(input) {
    const id = this.nextId('announcements');
    const item = { ...input, id, updated_at: nowIso(), is_active: input.is_active ?? true };
    this.state.announcements.push(item);
    this.persist();
    return item;
  }
  updateAnnouncement(id, patch) {
    const idx = this.state.announcements.findIndex(a => Number(a.id) === Number(id));
    if (idx === -1) return null;
    this.state.announcements[idx] = { ...this.state.announcements[idx], ...patch, updated_at: nowIso() };
    this.persist();
    return this.state.announcements[idx];
  }

  // Templates
  listTemplates() { return [...this.state.check_templates]; }
  getTemplate(id) { return this.state.check_templates.find(t => Number(t.id) === Number(id)); }
  createTemplate(input) {
    const id = this.nextId('check_templates');
    const item = { ...input, id, updated_at: nowIso() };
    this.state.check_templates.push(item);
    this.persist();
    return item;
  }
  updateTemplate(id, patch) {
    const idx = this.state.check_templates.findIndex(t => Number(t.id) === Number(id));
    if (idx === -1) return null;
    this.state.check_templates[idx] = { ...this.state.check_templates[idx], ...patch, updated_at: nowIso() };
    this.persist();
    return this.state.check_templates[idx];
  }

  // Daily checks
  listDailyChecks(filter = {}) {
    const { target_date, template_id } = filter;
    let list = [...this.state.daily_checks];
    if (target_date) list = list.filter(d => d.target_date === target_date);
    if (template_id) list = list.filter(d => Number(d.template_id) === Number(template_id));
    return list.sort((a,b)=> (b.target_date||'').localeCompare(a.target_date||''));
  }

  upsertDailyCheck(input) {
    const idx = this.state.daily_checks.findIndex(d => d.target_date === input.target_date && Number(d.template_id) === Number(input.template_id));
    if (idx === -1) {
      const id = this.nextId('daily_checks');
      const item = { ...input, id, updated_at: nowIso() };
      this.state.daily_checks.push(item);
      this.persist();
      return item;
    }
    this.state.daily_checks[idx] = { ...this.state.daily_checks[idx], ...input, updated_at: nowIso() };
    this.persist();
    return this.state.daily_checks[idx];
  }
}

const store = new DataStore();

// バリデーションユーティリティ
function validateProduct(input, categories) {
  const errors = {};
  if (!input.name || input.name.trim() === '') errors.name = '商品名は必須です。';
  if (input.name && (input.name.length < 1 || input.name.length > 60)) errors.name = '商品名は1〜60文字で入力してください。';
  if (!input.category_id) errors.category_id = 'カテゴリは必須です。';
  if (input.category_id && !categories.find(c => Number(c.id) === Number(input.category_id))) errors.category_id = 'カテゴリの指定が不正です（データが見つかりません）。';
  if (input.price !== undefined && input.price !== '' && !Number.isInteger(Number(input.price))) errors.price = '価格は整数で入力してください。';
  if (input.abv !== undefined && input.abv !== '' && (isNaN(Number(input.abv)) || Number(input.abv) < 0 || Number(input.abv) > 25)) errors.abv = '度数は0〜25の数値で入力してください。';
  if (input.polish !== undefined && input.polish !== '' && (isNaN(Number(input.polish)) || Number(input.polish) < 0 || Number(input.polish) > 100)) errors.polish = '精米歩合は0〜100の数値で入力してください。';
  if (input.sort_order !== undefined && input.sort_order !== '' && !Number.isInteger(Number(input.sort_order))) errors.sort_order = '表示順は整数で入力してください。';
  if (input.is_active !== undefined && typeof input.is_active !== 'boolean') errors.is_active = '公開状態は真偽値で入力してください。';
  return errors;
}

function validateAnnouncement(input) {
  const errors = {};
  if (!input.title || input.title.trim() === '') errors.title = 'タイトルは必須です。';
  if (!input.body || input.body.trim() === '') errors.body = '本文は必須です。';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const hasStart = input.start_date && input.start_date !== '';
  const hasEnd = input.end_date && input.end_date !== '';
  if (hasStart && !dateRegex.test(input.start_date)) errors.start_date = '開始日は YYYY-MM-DD 形式で入力してください。';
  if (hasEnd && !dateRegex.test(input.end_date)) errors.end_date = '終了日は YYYY-MM-DD 形式で入力してください。';
  if (hasStart && hasEnd && errors.start_date === undefined && errors.end_date === undefined) {
    if (new Date(input.start_date) > new Date(input.end_date)) {
      errors.start_date = '開始日は終了日より前の日付にしてください。';
    }
  }
  return errors;
}

function validateTemplate(input) {
  const errors = {};
  if (!input.name || input.name.trim() === '') errors.name = 'テンプレート名は必須です。';
  if (!Array.isArray(input.items) || input.items.length === 0) errors.items = 'チェック項目を1件以上追加してください。';
  return errors;
}

function validateDaily(input, template) {
  const errors = {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!input.target_date || !dateRegex.test(input.target_date)) errors.target_date = '日付は YYYY-MM-DD 形式で入力してください。';
  if (!template) errors.template_id = 'テンプレートの指定が不正です（データが見つかりません）。';
  if (template) {
    template.items.forEach(item => {
      const v = input.values?.[item.key];
      if (item.required && (v === undefined || v === '')) {
        errors[item.key] = `${item.label}は必須です。`;
      }
      if (item.type === 'select' && item.options && v !== undefined && v !== '' && !item.options.includes(v)) {
        errors[item.key] = `${item.label}の指定が不正です（データが見つかりません）。`;
      }
    });
  }
  return errors;
}

export {
  store,
  validateProduct,
  validateAnnouncement,
  validateTemplate,
  validateDaily
};
