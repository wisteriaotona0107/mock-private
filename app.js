const STORAGE_KEYS = {
    products: 'posProducts',
    sales: 'posSales',
    settings: 'posSettings'
};

const formatCurrency = (value) => `¥${value.toLocaleString('ja-JP')}`;
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const appState = {
    products: [],
    sales: [],
    cart: [],
    settings: {
        taxRate: 10
    },
    filteredSales: []
};

const loadState = () => {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.products);
    const savedSales = localStorage.getItem(STORAGE_KEYS.sales);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);

    appState.products = savedProducts ? JSON.parse(savedProducts) : getDefaultProducts();
    appState.sales = savedSales ? JSON.parse(savedSales) : [];
    appState.filteredSales = [...appState.sales];
    appState.settings = savedSettings ? JSON.parse(savedSettings) : appState.settings;
};

const persist = {
    products: () => localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(appState.products)),
    sales: () => localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(appState.sales)),
    settings: () => localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(appState.settings))
};

function getDefaultProducts() {
    return [
        { id: createId(), name: 'ブレンドコーヒー', sku: 'C001', price: 380 },
        { id: createId(), name: 'カフェラテ', sku: 'C002', price: 420 },
        { id: createId(), name: '紅茶', sku: 'T001', price: 360 },
        { id: createId(), name: 'サンドイッチ', sku: 'F001', price: 520 }
    ];
}

function initialize() {
    loadState();
    cacheDom();
    bindEvents();
    resetProductForm();
    renderProducts();
    renderProductOptions();
    renderCart();
    renderSales();
    updateSettingsUI();
    startClock();
}

const dom = {};

function cacheDom() {
    dom.productForm = document.querySelector('#productForm');
    dom.productId = document.querySelector('#productId');
    dom.productName = document.querySelector('#productName');
    dom.productSku = document.querySelector('#productSku');
    dom.productPrice = document.querySelector('#productPrice');
    dom.productSubmit = document.querySelector('#productSubmit');
    dom.productCancel = document.querySelector('#productCancel');
    dom.productSearch = document.querySelector('#productSearch');
    dom.productTableBody = document.querySelector('#productTableBody');

    dom.itemPicker = document.querySelector('#itemPicker');
    dom.itemSearch = document.querySelector('#itemSearch');
    dom.itemQuantity = document.querySelector('#itemQuantity');
    dom.addToCart = document.querySelector('#addToCart');

    dom.cartTableBody = document.querySelector('#cartTableBody');
    dom.subtotal = document.querySelector('#subtotal');
    dom.taxAmount = document.querySelector('#taxAmount');
    dom.totalAmount = document.querySelector('#totalAmount');
    dom.cashTendered = document.querySelector('#cashTendered');
    dom.changeAmount = document.querySelector('#changeAmount');
    dom.finalizeSale = document.querySelector('#finalizeSale');
    dom.clearCart = document.querySelector('#clearCart');

    dom.salesTableBody = document.querySelector('#salesTableBody');
    dom.salesCount = document.querySelector('#salesCount');
    dom.salesTotal = document.querySelector('#salesTotal');
    dom.salesDateFilter = document.querySelector('#salesDateFilter');
    dom.clearSalesFilter = document.querySelector('#clearSalesFilter');
    dom.receiptViewer = document.querySelector('#receiptViewer');
    dom.printReceipt = document.querySelector('#printReceipt');

    dom.taxRate = document.querySelector('#taxRate');
    dom.saveTaxRate = document.querySelector('#saveTaxRate');
    dom.clock = document.querySelector('#clock');
}

function bindEvents() {
    dom.productForm.addEventListener('submit', handleProductSubmit);
    dom.productCancel.addEventListener('click', resetProductForm);
    dom.productSearch.addEventListener('input', renderProducts);

    dom.itemSearch.addEventListener('input', renderProductOptions);
    dom.addToCart.addEventListener('click', handleAddToCart);

    dom.cashTendered.addEventListener('input', updateChangeDisplay);
    dom.finalizeSale.addEventListener('click', finalizeSale);
    dom.clearCart.addEventListener('click', clearCart);

    dom.salesDateFilter.addEventListener('change', handleSalesFilter);
    dom.clearSalesFilter.addEventListener('click', () => {
        dom.salesDateFilter.value = '';
        appState.filteredSales = [...appState.sales];
        renderSales();
    });

    dom.printReceipt.addEventListener('click', () => window.print());

    dom.saveTaxRate.addEventListener('click', () => {
        const value = Number(dom.taxRate.value);
        if (Number.isNaN(value) || value < 0 || value > 100) {
            alert('税率は0〜100の範囲で入力してください。');
            dom.taxRate.focus();
            return;
        }
        appState.settings.taxRate = value;
        persist.settings();
        renderCart();
    });
}

function handleProductSubmit(event) {
    event.preventDefault();
    const id = dom.productId.value || createId();
    const name = dom.productName.value.trim();
    const sku = dom.productSku.value.trim();
    const price = Number(dom.productPrice.value);

    if (!name) {
        alert('商品名を入力してください');
        return;
    }

    if (price < 0) {
        alert('価格は0以上で入力してください');
        return;
    }

    const existingIndex = appState.products.findIndex((product) => product.id === id);
    const payload = { id, name, sku, price };

    if (existingIndex >= 0) {
        appState.products.splice(existingIndex, 1, payload);
    } else {
        appState.products.push(payload);
    }

    appState.products.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    persist.products();
    renderProducts();
    renderProductOptions();
    resetProductForm();
}

function resetProductForm() {
    dom.productId.value = '';
    dom.productName.value = '';
    dom.productSku.value = '';
    dom.productPrice.value = '';
    dom.productSubmit.textContent = '商品登録';
    dom.productCancel.disabled = true;
}

function renderProducts() {
    const keyword = dom.productSearch.value.trim().toLowerCase();
    const fragment = document.createDocumentFragment();

    appState.products
        .filter((product) => {
            if (!keyword) return true;
            return [product.name, product.sku].some((value) =>
                value && value.toLowerCase().includes(keyword)
            );
        })
        .forEach((product) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.sku || '-'}</td>
                <td class="align-right">${formatCurrency(product.price)}</td>
                <td>
                    <div class="table-actions">
                        <button class="secondary" data-action="edit" data-id="${product.id}">編集</button>
                        <button class="danger" data-action="delete" data-id="${product.id}">削除</button>
                    </div>
                </td>
            `;
            fragment.appendChild(row);
        });

    dom.productTableBody.innerHTML = '';
    dom.productTableBody.appendChild(fragment);

    dom.productTableBody.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', handleProductAction);
    });
}

function handleProductAction(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const product = appState.products.find((item) => item.id === id);

    if (!product) return;

    if (action === 'edit') {
        dom.productId.value = product.id;
        dom.productName.value = product.name;
        dom.productSku.value = product.sku;
        dom.productPrice.value = product.price;
        dom.productSubmit.textContent = '商品更新';
        dom.productCancel.disabled = false;
        dom.productName.focus();
    }

    if (action === 'delete') {
        if (confirm(`${product.name} を削除しますか？`)) {
            appState.products = appState.products.filter((item) => item.id !== id);
            persist.products();
            renderProducts();
            renderProductOptions();
        }
    }
}

function renderProductOptions() {
    const keyword = dom.itemSearch.value.trim().toLowerCase();
    const fragment = document.createDocumentFragment();

    appState.products
        .filter((product) => {
            if (!keyword) return true;
            return [product.name, product.sku].some((value) =>
                value && value.toLowerCase().includes(keyword)
            );
        })
        .forEach((product) => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.sku || 'SKUなし'}) - ${formatCurrency(product.price)}`;
            fragment.appendChild(option);
        });

    dom.itemPicker.innerHTML = '';
    dom.itemPicker.appendChild(fragment);
}

function handleAddToCart() {
    const productId = dom.itemPicker.value;
    const quantity = Number(dom.itemQuantity.value);

    if (!productId) {
        alert('商品を選択してください');
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert('数量は1以上の整数で入力してください');
        dom.itemQuantity.focus();
        return;
    }

    const product = appState.products.find((item) => item.id === productId);
    if (!product) {
        alert('選択した商品が見つかりません');
        return;
    }

    const existing = appState.cart.find((item) => item.product.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        appState.cart.push({ product, quantity });
    }

    dom.itemQuantity.value = 1;
    renderCart();
}

function renderCart() {
    const fragment = document.createDocumentFragment();

    appState.cart.forEach((entry) => {
        const row = document.createElement('tr');
        const subtotal = entry.product.price * entry.quantity;
        row.innerHTML = `
            <td>${entry.product.name}</td>
            <td class="align-right">
                <input type="number" class="cart-quantity" data-id="${entry.product.id}" value="${entry.quantity}" min="1">
            </td>
            <td class="align-right">${formatCurrency(entry.product.price)}</td>
            <td class="align-right">${formatCurrency(subtotal)}</td>
            <td class="align-right">
                <button class="danger" data-action="remove" data-id="${entry.product.id}">削除</button>
            </td>
        `;
        fragment.appendChild(row);
    });

    dom.cartTableBody.innerHTML = '';
    dom.cartTableBody.appendChild(fragment);

    dom.cartTableBody.querySelectorAll('input.cart-quantity').forEach((input) => {
        input.addEventListener('change', handleCartQuantityChange);
    });

    dom.cartTableBody.querySelectorAll('button[data-action="remove"]').forEach((button) => {
        button.addEventListener('click', handleCartRemove);
    });

    updateCartTotals();
}

function handleCartQuantityChange(event) {
    const input = event.currentTarget;
    const id = input.dataset.id;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0) {
        alert('数量は1以上の整数を入力してください');
        renderCart();
        return;
    }

    const entry = appState.cart.find((item) => item.product.id === id);
    if (entry) {
        entry.quantity = value;
    }

    updateCartTotals();
}

function handleCartRemove(event) {
    const id = event.currentTarget.dataset.id;
    appState.cart = appState.cart.filter((item) => item.product.id !== id);
    renderCart();
}

function clearCart() {
    if (appState.cart.length === 0) return;
    if (confirm('カートを空にしますか？')) {
        appState.cart = [];
        renderCart();
    }
}

function updateCartTotals() {
    const subtotal = appState.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = appState.settings.taxRate / 100;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    dom.subtotal.textContent = formatCurrency(subtotal);
    dom.taxAmount.textContent = formatCurrency(tax);
    dom.totalAmount.textContent = formatCurrency(total);

    const cash = Number(dom.cashTendered.value);
    if (!Number.isNaN(cash) && cash > 0) {
        const change = Math.max(0, cash - total);
        dom.changeAmount.textContent = formatCurrency(change);
    } else {
        dom.changeAmount.textContent = formatCurrency(0);
    }
}

function updateChangeDisplay() {
    updateCartTotals();
}

function finalizeSale() {
    if (appState.cart.length === 0) {
        alert('カートに商品がありません');
        return;
    }

    const cash = Number(dom.cashTendered.value);
    if (Number.isNaN(cash) || cash <= 0) {
        alert('お預かり金額を入力してください');
        dom.cashTendered.focus();
        return;
    }

    const subtotal = appState.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = Math.round(subtotal * (appState.settings.taxRate / 100));
    const total = subtotal + tax;

    if (cash < total) {
        alert('お預かり金額が不足しています');
        dom.cashTendered.focus();
        return;
    }

    const sale = {
        id: createId(),
        timestamp: new Date().toISOString(),
        items: appState.cart.map((entry) => ({
            productId: entry.product.id,
            name: entry.product.name,
            sku: entry.product.sku,
            price: entry.product.price,
            quantity: entry.quantity
        })),
        subtotal,
        tax,
        total,
        cash,
        change: cash - total
    };

    appState.sales.unshift(sale);
    appState.filteredSales = [...appState.sales];
    persist.sales();

    renderSales();
    updateReceipt(sale);

    appState.cart = [];
    dom.cashTendered.value = '';
    renderCart();
}

function handleSalesFilter() {
    const dateValue = dom.salesDateFilter.value;
    if (!dateValue) {
        appState.filteredSales = [...appState.sales];
    } else {
        appState.filteredSales = appState.sales.filter((sale) =>
            sale.timestamp.startsWith(dateValue)
        );
    }
    renderSales();
}

function renderSales() {
    const fragment = document.createDocumentFragment();

    appState.filteredSales.forEach((sale) => {
        const row = document.createElement('tr');
        const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        const date = new Date(sale.timestamp);
        row.innerHTML = `
            <td>${date.toLocaleString('ja-JP')}</td>
            <td>${sale.id}</td>
            <td class="align-right">${totalItems}</td>
            <td class="align-right">${formatCurrency(sale.total)}</td>
            <td><button class="secondary" data-id="${sale.id}">表示</button></td>
        `;
        fragment.appendChild(row);
    });

    dom.salesTableBody.innerHTML = '';
    dom.salesTableBody.appendChild(fragment);

    dom.salesTableBody.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
            const sale = appState.sales.find((item) => item.id === button.dataset.id);
            if (sale) updateReceipt(sale);
        });
    });

    dom.salesCount.textContent = appState.filteredSales.length;
    const total = appState.filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    dom.salesTotal.textContent = formatCurrency(total);

    if (appState.filteredSales.length > 0) {
        updateReceipt(appState.filteredSales[0]);
    } else {
        dom.receiptViewer.textContent = '該当する取引がありません。';
    }
}

function updateReceipt(sale) {
    const date = new Date(sale.timestamp);
    const lines = [];
    lines.push('==============================');
    lines.push('        POSレシート');
    lines.push('==============================');
    lines.push(`日時: ${date.toLocaleString('ja-JP')}`);
    lines.push(`取引番号: ${sale.id}`);
    lines.push('------------------------------');
    sale.items.forEach((item) => {
        const subtotal = item.price * item.quantity;
        lines.push(`${item.name}`);
        lines.push(`  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(subtotal)}`);
    });
    lines.push('------------------------------');
    lines.push(`小計: ${formatCurrency(sale.subtotal)}`);
    lines.push(`消費税 (${appState.settings.taxRate}%): ${formatCurrency(sale.tax)}`);
    lines.push(`合計: ${formatCurrency(sale.total)}`);
    lines.push(`お預かり: ${formatCurrency(sale.cash)}`);
    lines.push(`お釣り: ${formatCurrency(sale.change)}`);
    lines.push('==============================');
    lines.push('ご利用ありがとうございました');
    dom.receiptViewer.textContent = lines.join('\n');
}

function updateSettingsUI() {
    dom.taxRate.value = appState.settings.taxRate;
}

function startClock() {
    const update = () => {
        const now = new Date();
        dom.clock.textContent = now.toLocaleString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    update();
    setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initialize);
