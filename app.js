import { store, validateProduct, validateAnnouncement, validateTemplate, validateDaily } from './api.js';

// シンプルな状態管理
const state = {
  user: null,
  route: location.hash.replace('#','') || 'login',
  current: {},
  errors: {}
};

function setRoute(route) {
  if (route.startsWith('/')) route = route.slice(1);
  state.route = route;
  location.hash = route;
  render();
}

window.addEventListener('hashchange', () => {
  state.route = location.hash.replace('#','') || 'login';
  render();
});

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k,v);
  });
  if (!Array.isArray(children)) children = [children];
  children.filter(Boolean).forEach(c => node.append(c));
  return node;
}

function showErrors(errors) {
  state.errors = errors;
}

function clearErrors() { state.errors = {}; }

function header(title, actions = []) {
  const backBtn = el('button', { class: 'secondary', id:'back-btn' }, '戻る');
  backBtn.onclick = () => history.back();
  const h = el('header', {}, [backBtn, el('h1',{text:title})]);
  actions.forEach(btn => h.append(btn));
  return h;
}

function errorSummary() {
  const keys = Object.keys(state.errors||{});
  if (keys.length === 0) return null;
  return el('div',{class:'error-summary'}, `${keys.length}件のエラーがあります。入力を確認してください。`);
}

function guardLogin(next) {
  if (!state.user) { setRoute('login'); return false; }
  return next();
}

function renderLogin() {
  const container = el('div');
  container.append(header('ログイン'));
  const main = el('main');
  const form = el('div',{class:'card'});
  form.append(el('p',{},'IDとパスワードを入力してください（モックのため任意でOK）'));
  const idInput = el('input',{placeholder:'ユーザーID', value: state.current.login_id||''});
  const pwInput = el('input',{placeholder:'パスワード', type:'password', value: state.current.login_pw||''});
  const btn = el('button',{},'ログイン');
  btn.onclick = () => {
    state.user = { name: idInput.value || 'オーナー' };
    setRoute('dashboard');
  };
  form.append(idInput, pwInput, btn);
  main.append(form);
  container.append(main);
  return container;
}

function renderDashboard() {
  return guardLogin(() => {
    const container = el('div');
    container.append(header('ダッシュボード'));
    const main = el('main');
    main.append(el('div',{class:'card'},[
      el('h3',{text:'クイックアクセス'}),
      el('div',{class:'toolbar'},[
        linkButton('商品管理','products'),
        linkButton('カテゴリ','categories'),
        linkButton('お知らせ','announcements'),
        linkButton('日次テンプレ','templates'),
        linkButton('日次記録','daily'),
        linkButton('エクスポート/インポート','export')
      ]),
      el('p',{class:'notice'},'保存はブラウザ内のみです。確定するにはエクスポートしたJSONを差し替えてください。')
    ]));
    container.append(main);
    return container;
  });
}

function linkButton(label, route) {
  const b = el('button',{},label);
  b.onclick = () => setRoute(route);
  return b;
}

function renderProducts() {
  return guardLogin(() => {
    const container = el('div');
    const addBtn = el('button',{},'新規');
    addBtn.onclick = () => { state.current = {}; clearErrors(); setRoute('product_edit'); };
    container.append(header('商品', [addBtn]));
    const main = el('main');
    const filterCard = el('div',{class:'card'});
    const search = el('input',{placeholder:'キーワード'});
    const categorySelect = el('select');
    categorySelect.append(el('option',{value:''},'カテゴリ絞り込み'));
    store.listCategories().forEach(c => categorySelect.append(el('option',{value:c.id, text:c.name})));
    const activeOnly = el('input',{type:'checkbox'});
    const runFilter = () => {
      const list = store.listProducts({ q:search.value, category_id: categorySelect.value, activeOnly: activeOnly.checked });
      renderList(list);
    };
    [search, categorySelect, activeOnly].forEach(i => i.oninput = runFilter);
    filterCard.append(el('div',{class:'flex'},[
      el('div',{class:'col'},[el('label',{text:'検索'}), search]),
      el('div',{class:'col'},[el('label',{text:'カテゴリ'}), categorySelect]),
      el('div',{class:'col'},[el('label',{text:'公開のみ'}), activeOnly])
    ]));
    main.append(filterCard);

    const listWrap = el('div');
    function renderList(list) {
      listWrap.innerHTML = '';
      list.forEach(p => {
        const row = el('div',{class:'list-item'},[
          el('div',{},[
            el('div',{text:p.name || '(名称未設定)'}),
            el('small',{class:'muted',text:`${p.price||'-'}円 / ${categoryName(p.category_id) || '未分類'}`}),
            el('div',{},[el('span',{class:'badge',text:p.is_active===false?'停止中':'公開中'}), ' ', el('span',{class:'badge',text:`更新:${(p.updated_at||'').slice(0,10)}`})])
          ]),
          el('div',{},[
            el('button',{class:'secondary'},'編集'),
            ' ',
            el('button',{class:p.is_active===false?'':'secondary'}, p.is_active===false?'公開':'停止')
          ])
        ]);
        row.querySelectorAll('button')[0].onclick = () => { state.current = p; clearErrors(); setRoute('product_edit'); };
        row.querySelectorAll('button')[1].onclick = () => { store.toggleProductActive(p.id, !(p.is_active===false)); render(); };
        listWrap.append(row);
      });
    }
    renderList(store.listProducts({}));
    main.append(listWrap);
    container.append(main);
    return container;
  });
}

function categoryName(id) {
  const c = store.getCategory(id);
  return c? c.name : '';
}

function renderProductEdit() {
  return guardLogin(() => {
    const editing = state.current || {};
    const isNew = !editing.id;
    const container = el('div');
    const saveBtn = el('button',{},'保存');
    const backBtn = el('button',{class:'secondary'},'一覧へ');
    backBtn.onclick = () => setRoute('products');
    saveBtn.onclick = () => {
      const formData = collectProduct();
      const errors = validateProduct(formData, store.listCategories());
      showErrors(errors);
      if (Object.keys(errors).length) { render(); return; }
      if (isNew) store.createProduct(formData); else store.updateProduct(editing.id, formData);
      clearErrors();
      alert('ブラウザ内に保存しました。確定するにはエクスポートしてください。');
      setRoute('products');
    };
    container.append(header(isNew?'商品追加':'商品編集',[saveBtn, backBtn]));
    const main = el('main');
    main.append(errorSummary());
    const card = el('div',{class:'card'});
    const name = inputField('商品名', editing.name, 'text', 'name');
    const desc = textareaField('説明', editing.desc, 'desc');
    const price = inputField('価格', editing.price ?? '', 'number', 'price');
    const category = selectField('カテゴリ', store.listCategories(), editing.category_id, 'category_id');
    const abv = inputField('度数(ABV)', editing.abv ?? '', 'number', 'abv');
    const polish = inputField('精米歩合', editing.polish ?? '', 'number', 'polish');
    const sort = inputField('表示順', editing.sort_order ?? '', 'number', 'sort_order');
    const active = checkboxField('公開', editing.is_active !== false, 'is_active');
    card.append(name, desc, price, category, abv, polish, sort, active);
    main.append(card);
    container.append(main);

    function collectProduct() {
      return {
        name: name.querySelector('input').value.trim(),
        desc: desc.querySelector('textarea').value.trim(),
        price: price.querySelector('input').value === '' ? undefined : Number(price.querySelector('input').value),
        category_id: category.querySelector('select').value,
        abv: abv.querySelector('input').value === '' ? undefined : Number(abv.querySelector('input').value),
        polish: polish.querySelector('input').value === '' ? undefined : Number(polish.querySelector('input').value),
        sort_order: sort.querySelector('input').value === '' ? undefined : Number(sort.querySelector('input').value),
        is_active: active.querySelector('input').checked
      };
    }
    return container;
  });
}

function inputField(labelText, value, type, key) {
  const wrap = el('div');
  wrap.append(el('label',{text:labelText}));
  const input = el('input',{type:type||'text', value: value ?? ''});
  wrap.append(input);
  if (state.errors[key]) wrap.append(el('div',{class:'error-text',text:state.errors[key]}));
  return wrap;
}

function textareaField(labelText, value, key) {
  const wrap = el('div');
  wrap.append(el('label',{text:labelText}));
  const input = el('textarea',{}, value||'');
  wrap.append(input);
  if (state.errors[key]) wrap.append(el('div',{class:'error-text',text:state.errors[key]}));
  return wrap;
}

function selectField(labelText, options, value, key) {
  const wrap = el('div');
  wrap.append(el('label',{text:labelText}));
  const sel = el('select');
  sel.append(el('option',{value:'',text:'選択してください'}));
  options.forEach(o => sel.append(el('option',{value:o.id, text:o.name})));
  sel.value = value ?? '';
  wrap.append(sel);
  if (state.errors[key]) wrap.append(el('div',{class:'error-text',text:state.errors[key]}));
  return wrap;
}

function checkboxField(labelText, checked, key) {
  const wrap = el('div');
  const label = el('label');
  const input = el('input',{type:'checkbox'});
  input.checked = !!checked;
  label.append(input, ' ', labelText);
  wrap.append(label);
  if (state.errors[key]) wrap.append(el('div',{class:'error-text',text:state.errors[key]}));
  return wrap;
}

function renderCategories() {
  return guardLogin(() => {
    const container = el('div');
    const addBtn = el('button',{},'追加');
    addBtn.onclick = () => {
      const name = prompt('カテゴリ名');
      if (!name) return;
      store.createCategory({ name, sort_order: store.listCategories().length + 1 });
      render();
    };
    container.append(header('カテゴリ',[addBtn]));
    const main = el('main');
    const card = el('div',{class:'card'});
    const table = el('table',{class:'table'});
    table.innerHTML = '<tr><th>ID</th><th>名称</th><th>並び順</th><th></th></tr>';
    store.listCategories().forEach(c => {
      const tr = el('tr');
      const nameInput = el('input',{value:c.name});
      const orderInput = el('input',{value:c.sort_order, type:'number'});
      const save = el('button',{},'保存');
      save.onclick = () => {
        store.updateCategory(c.id,{ name:nameInput.value, sort_order:Number(orderInput.value)});
        alert('ブラウザ内に保存しました。');
      };
      tr.append(el('td',{},c.id), el('td',{},nameInput), el('td',{},orderInput), el('td',{},save));
      table.append(tr);
    });
    card.append(table);
    main.append(card);
    container.append(main);
    return container;
  });
}

function renderAnnouncements() {
  return guardLogin(() => {
    const container = el('div');
    const addBtn = el('button',{},'新規');
    addBtn.onclick = () => { state.current = {}; clearErrors(); setRoute('announcement_edit'); };
    container.append(header('お知らせ',[addBtn]));
    const main = el('main');
    const list = el('div');
    store.listAnnouncements().forEach(a => {
      const row = el('div',{class:'list-item'},[
        el('div',{},[
          el('div',{text:a.title}),
          el('small',{class:'muted',text:`${a.start_date||'未設定'} ~ ${a.end_date||'未設定'}`})
        ]),
        el('div',{},[
          el('button',{class:'secondary'},'編集'),
          ' ',
          el('span',{class:'badge',text:a.is_active===false?'停止中':'公開中'})
        ])
      ]);
      row.querySelector('button').onclick = () => { state.current = a; clearErrors(); setRoute('announcement_edit'); };
      list.append(row);
    });
    main.append(list);
    container.append(main);
    return container;
  });
}

function renderAnnouncementEdit() {
  return guardLogin(() => {
    const data = state.current || {};
    const isNew = !data.id;
    const container = el('div');
    const saveBtn = el('button',{},'保存');
    saveBtn.onclick = () => {
      const formData = collect();
      const errors = validateAnnouncement(formData);
      showErrors(errors);
      if (Object.keys(errors).length) { render(); return; }
      if (isNew) store.createAnnouncement(formData); else store.updateAnnouncement(data.id, formData);
      clearErrors();
      alert('ブラウザ内に保存しました。確定するにはエクスポートしてください。');
      setRoute('announcements');
    };
    container.append(header(isNew?'お知らせ追加':'お知らせ編集',[saveBtn, linkButton('一覧','announcements')]));
    const main = el('main');
    main.append(errorSummary());
    const card = el('div',{class:'card'});
    const title = inputField('タイトル', data.title, 'text', 'title');
    const body = textareaField('本文', data.body, 'body');
    const start = inputField('開始日', data.start_date || '', 'date', 'start_date');
    const end = inputField('終了日', data.end_date || '', 'date', 'end_date');
    const active = checkboxField('公開する', data.is_active !== false, 'is_active');
    card.append(title, body, start, end, active);
    main.append(card);
    container.append(main);

    function collect() {
      return {
        title: title.querySelector('input').value.trim(),
        body: body.querySelector('textarea').value.trim(),
        start_date: start.querySelector('input').value,
        end_date: end.querySelector('input').value,
        is_active: active.querySelector('input').checked
      };
    }
    return container;
  });
}

function renderTemplates() {
  return guardLogin(() => {
    const container = el('div');
    const addBtn = el('button',{},'新規');
    addBtn.onclick = () => { state.current = { items: [] }; clearErrors(); setRoute('template_edit'); };
    container.append(header('日次テンプレ',[addBtn]));
    const main = el('main');
    const list = el('div');
    store.listTemplates().forEach(t => {
      const row = el('div',{class:'list-item'},[
        el('div',{},[
          el('div',{text:t.name}),
          el('small',{class:'muted',text:`項目数: ${t.items?.length || 0}`})
        ]),
        el('button',{class:'secondary'},'編集')
      ]);
      row.querySelector('button').onclick = () => { state.current = t; clearErrors(); setRoute('template_edit'); };
      list.append(row);
    });
    main.append(list);
    container.append(main);
    return container;
  });
}

function renderTemplateEdit() {
  return guardLogin(() => {
    const data = state.current || { items: [] };
    const isNew = !data.id;
    const container = el('div');
    const saveBtn = el('button',{},'保存');
    saveBtn.onclick = () => {
      const formData = collect();
      const errors = validateTemplate(formData);
      showErrors(errors);
      if (Object.keys(errors).length) { render(); return; }
      if (isNew) store.createTemplate(formData); else store.updateTemplate(data.id, formData);
      clearErrors();
      alert('ブラウザ内に保存しました。確定するにはエクスポートしてください。');
      setRoute('templates');
    };
    container.append(header(isNew?'テンプレ追加':'テンプレ編集',[saveBtn, linkButton('一覧','templates')]));
    const main = el('main');
    main.append(errorSummary());
    const card = el('div',{class:'card'});
    const name = inputField('テンプレート名', data.name, 'text', 'name');
    const itemsWrap = el('div');
    (data.items||[]).forEach(addItemRow);
    const addBtn = el('button',{},'項目追加');
    addBtn.onclick = () => addItemRow({ key:`item${Date.now()}`, label:'', type:'text', required:false });
    card.append(name, itemsWrap, addBtn);
    main.append(card);
    container.append(main);

    function addItemRow(item) {
      const row = el('div',{class:'card'},[
        inputField('ラベル', item.label, 'text', item.key+'_label'),
        inputField('キー', item.key, 'text', item.key+'_key'),
        (()=>{
          const wrap = el('div');
          wrap.append(el('label',{text:'タイプ'}));
          const sel = el('select');
          ['text','select'].forEach(t=> sel.append(el('option',{value:t,text:t})));
          sel.value = item.type || 'text';
          wrap.append(sel);
          row.sel = sel;
          return wrap;
        })(),
        textareaField('選択肢(カンマ区切り select時のみ)', item.options?.join(',')||'', item.key+'_options'),
        checkboxField('必須', item.required, item.key+'_required')
      ]);
      row.itemRef = item;
      itemsWrap.append(row);
    }

    function collect() {
      const items = Array.from(itemsWrap.children).map(child => {
        const [labelField, keyField, typeWrap, optionsField, reqField] = child.children;
        const type = typeWrap.querySelector('select').value;
        const opts = optionsField.querySelector('textarea').value.split(',').map(v=>v.trim()).filter(Boolean);
        return {
          label: labelField.querySelector('input').value,
          key: keyField.querySelector('input').value,
          type,
          options: type==='select'?opts:undefined,
          required: reqField.querySelector('input').checked
        };
      });
      return { name: name.querySelector('input').value.trim(), items };
    }
    return container;
  });
}

function renderDaily() {
  return guardLogin(() => {
    const container = el('div');
    container.append(header('日次記録'));
    const main = el('main');
    const card = el('div',{class:'card'});
    const templateSelect = el('select');
    templateSelect.append(el('option',{value:'',text:'テンプレートを選択'}));
    store.listTemplates().forEach(t => templateSelect.append(el('option',{value:t.id,text:t.name})));
    const dateInput = el('input',{type:'date', value: new Date().toISOString().slice(0,10)});
    const listWrap = el('div');
    const applyBtn = el('button',{},'表示');
    applyBtn.onclick = () => renderForm();
    card.append(el('div',{class:'flex'},[
      el('div',{class:'col'},[el('label',{text:'日付'}), dateInput]),
      el('div',{class:'col'},[el('label',{text:'テンプレート'}), templateSelect]),
      el('div',{class:'col'},[applyBtn])
    ]));
    card.append(listWrap);
    main.append(card);
    container.append(main);

    function renderForm() {
      listWrap.innerHTML = '';
      const template = store.getTemplate(templateSelect.value);
      const existing = store.listDailyChecks({ target_date: dateInput.value, template_id: templateSelect.value })[0];
      if (!template) { listWrap.append(el('p',{class:'muted',text:'テンプレートを選択してください。'})); return; }
      const values = existing?.values || {};
      const formCard = el('div',{class:'card'});
      formCard.append(errorSummary());
      formCard.append(el('p',{class:'notice'},'必須項目は未入力不可です。同日・同テンプレは上書き保存されます。'));
      const valueInputs = {};
      template.items.forEach(item => {
        const wrap = el('div');
        wrap.append(el('label',{text:item.label}));
        if (item.type === 'select') {
          const sel = el('select');
          sel.append(el('option',{value:'',text:'選択してください'}));
          (item.options||[]).forEach(o => sel.append(el('option',{value:o,text:o})));
          sel.value = values[item.key] || '';
          valueInputs[item.key] = sel;
          wrap.append(sel);
        } else {
          const input = el('input',{value: values[item.key] || ''});
          valueInputs[item.key] = input;
          wrap.append(input);
        }
        if (state.errors[item.key]) wrap.append(el('div',{class:'error-text',text:state.errors[item.key]}));
        formCard.append(wrap);
      });
      const save = el('button',{},'保存');
      save.onclick = () => {
        const payload = { target_date: dateInput.value, template_id: Number(templateSelect.value), values: {} };
        Object.entries(valueInputs).forEach(([k,input]) => payload.values[k] = input.value);
        const errors = validateDaily(payload, template);
        showErrors(errors);
        if (Object.keys(errors).length) { render(); return; }
        store.upsertDailyCheck(payload);
        clearErrors();
        alert('ブラウザ内に保存しました。確定するにはエクスポートしてください。');
        render();
      };
      formCard.append(save);
      listWrap.append(formCard);

      const history = el('div',{class:'card'});
      history.append(el('h4',{text:'当日の履歴'}));
      const items = store.listDailyChecks({ target_date: dateInput.value });
      items.forEach(i => {
        history.append(el('div',{class:'list-item'},[
          el('div',{},[
            el('div',{text:`${template.name} (${i.target_date})`}),
            el('small',{class:'muted',text: JSON.stringify(i.values)})
          ]),
          el('span',{class:'badge',text:'保存済'})
        ]));
      });
      listWrap.append(history);
    }

    renderForm();
    return container;
  });
}

function renderExport() {
  return guardLogin(() => {
    const container = el('div');
    container.append(header('エクスポート/インポート'));
    const main = el('main');
    const card = el('div',{class:'card'});
    card.append(el('p',{},'ブラウザ内データをJSONとしてダウンロードできます。サーバーに直接書き込みは行いません。'));
    const files = [
      ['products.json', ()=>store.state.products],
      ['categories.json', ()=>store.state.categories],
      ['announcements.json', ()=>store.state.announcements],
      ['check_templates.json', ()=>store.state.check_templates],
      [`daily_checks_${store.state.meta.daily_check_month||''}.json`, ()=>store.state.daily_checks],
      ['meta.json', ()=>store.state.meta]
    ];
    files.forEach(([name,get]) => {
      const btn = el('button',{},`${name} をダウンロード`);
      btn.onclick = () => store.exportJson(name, get());
      card.append(btn, el('br'));
    });

    const importInput = el('input',{type:'file',accept:'application/json'});
    importInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = await store.importJson(file);
        alert('読み込みました。適切な画面で反映してください。');
        console.log('import preview', data);
      } catch (err) {
        alert('JSONの読み込みに失敗しました。');
      }
    };
    card.append(el('h4',{text:'インポート(プレビューのみ)'}), importInput);
    main.append(card);
    container.append(main);
    return container;
  });
}

const routes = {
  'login': renderLogin,
  'dashboard': renderDashboard,
  'products': renderProducts,
  'product_edit': renderProductEdit,
  'categories': renderCategories,
  'announcements': renderAnnouncements,
  'announcement_edit': renderAnnouncementEdit,
  'templates': renderTemplates,
  'template_edit': renderTemplateEdit,
  'daily': renderDaily,
  'export': renderExport
};

async function init() {
  await store.loadAll();
  render();
}

function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  const route = routes[state.route] ? state.route : 'login';
  const view = routes[route]();
  if (view) root.append(view);
}

init();
