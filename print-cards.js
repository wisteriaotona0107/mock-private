const ITEMS_PER_PAGE = 6;

const FALLBACK_ITEMS = [
  {
    id: 1,
    name: "獺祭 純米大吟醸 45",
    desc: "華やかな吟醸香とキレの良さ。",
    img: "./img/img001.png",
    price: 600,
  },
  {
    id: 2,
    name: "新政 No.6 S-type",
    desc: "フレッシュで軽快な酸味と透明感。",
    img: "./img/img002.png",
    price: 850,
  },
  {
    id: 3,
    name: "而今 特別純米",
    desc: "旨みと余韻のバランスが心地よい一本。",
    img: "./img/img003.png",
    price: 780,
  },
];

function chunkItems(items, chunkSize) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function formatPrice(price) {
  const numericPrice = Number(price) || 0;
  return `¥${numericPrice.toLocaleString("ja-JP")}`;
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "card-image-wrap";

  const image = document.createElement("img");
  image.className = "card-image";
  image.src = item.img;
  image.alt = `${item.name} の商品画像`;
  image.loading = "lazy";
  image.onerror = () => {
    image.alt = `${item.name} の画像を表示できません`;
    imageWrap.textContent = "NO IMAGE";
    imageWrap.style.display = "grid";
    imageWrap.style.placeItems = "center";
    imageWrap.style.color = "#6b6459";
    imageWrap.style.fontSize = "0.85rem";
  };

  imageWrap.appendChild(image);

  const name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = item.name;

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = item.desc;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = formatPrice(item.price);

  const id = document.createElement("p");
  id.className = "card-id";
  id.textContent = `ID: ${item.id}`;

  footer.append(price, id);
  card.append(imageWrap, name, desc, footer);

  return card;
}

function createEmptyCard() {
  const emptyCard = document.createElement("article");
  emptyCard.className = "card empty";
  emptyCard.setAttribute("aria-hidden", "true");
  return emptyCard;
}

function renderPages(items) {
  const pagesRoot = document.getElementById("pages");
  pagesRoot.innerHTML = "";

  const sourceItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const pages = chunkItems(sourceItems, ITEMS_PER_PAGE);

  pages.forEach((pageItems) => {
    const page = document.createElement("section");
    page.className = "page";

    pageItems.forEach((item) => {
      page.appendChild(createCard(item));
    });

    const emptiesNeeded = ITEMS_PER_PAGE - pageItems.length;
    for (let index = 0; index < emptiesNeeded; index += 1) {
      page.appendChild(createEmptyCard());
    }

    pagesRoot.appendChild(page);
  });
}

async function loadItems() {
  try {
    const response = await fetch("./data/sake-list.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("JSON format is not an array");
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      desc: item.desc,
      img: item.img,
      price: item.price,
    }));
  } catch (error) {
    console.warn("sake-list.json の読み込みに失敗したためフォールバックを利用します。", error);
    return FALLBACK_ITEMS;
  }
}

async function init() {
  const printButton = document.getElementById("printButton");
  printButton.addEventListener("click", () => window.print());

  const items = await loadItems();
  renderPages(items);
}

window.addEventListener("DOMContentLoaded", init);
