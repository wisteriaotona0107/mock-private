import { qs, createEl } from './utils.js';

const NEWS = [
  {
    id: 'n1',
    title: '市立病院改築工事に着工しました',
    date: '2025-02-14',
    tags: ['施工', '地域貢献'],
    excerpt: '地域医療を支える市立病院の改築工事が本格スタート。最新の医療設備を備えた新棟を2026年春に竣工予定です。'
  },
  {
    id: 'n2',
    title: '安全衛生優良企業に認定されました',
    date: '2025-01-20',
    tags: ['安全', '表彰'],
    excerpt: '全国建設業協会より安全衛生管理の模範企業として表彰を受けました。全社員の安全意識向上に努めています。'
  },
  {
    id: 'n3',
    title: '地域清掃活動「街まるごとクリーンデー」開催',
    date: '2024-12-05',
    tags: ['地域貢献'],
    excerpt: '毎年恒例の清掃活動を実施し、協力会社と地域住民の皆さまとともに市内15カ所を清掃しました。'
  },
  {
    id: 'n4',
    title: 'BIM活用セミナーをオンライン開催',
    date: '2024-11-12',
    tags: ['DX', 'セミナー'],
    excerpt: '設計段階から施工管理まで活用できるBIMの最新事例を紹介するセミナーを開催し、多くの自治体・企業が参加しました。'
  },
  {
    id: 'n5',
    title: '新卒採用2026のエントリー受付を開始',
    date: '2024-10-01',
    tags: ['採用'],
    excerpt: '次世代の街づくりを担う仲間を募集しています。技術系・事務系ともに複数職種でエントリー可能です。'
  }
];

export const initNews = () => {
  const list = qs('#news-list');
  const tagContainer = qs('#news-tags');
  if (!list || !tagContainer) return;

  let activeTag = 'all';
  const allTags = ['all', ...new Set(NEWS.flatMap((item) => item.tags))];

  const renderTags = () => {
    tagContainer.innerHTML = '';
    allTags.forEach((tag) => {
      const button = createEl('button', {
        className: 'tag-btn',
        text: tag === 'all' ? 'すべて' : `#${tag}`,
        attrs: {
          type: 'button',
          'data-tag': tag,
          'aria-pressed': String(activeTag === tag)
        }
      });
      button.addEventListener('click', () => {
        activeTag = tag;
        renderTags();
        renderNews();
      });
      tagContainer.appendChild(button);
    });
  };

  const renderNews = () => {
    list.innerHTML = '';
    const filtered = NEWS.filter((item) => activeTag === 'all' || item.tags.includes(activeTag)).slice(0, 3);
    if (!filtered.length) {
      list.appendChild(createEl('p', { text: '該当するお知らせはありません。' }));
      return;
    }
    filtered.forEach((item) => {
      const card = createEl('article', { className: 'news-card', attrs: { 'data-news-id': item.id } });
      const meta = createEl('div', { className: 'news-card__meta' });
      const tag = item.tags[0] || 'お知らせ';
      meta.append(
        createEl('span', { className: 'news-card__tag', text: tag }),
        createEl('time', { attrs: { datetime: item.date }, text: formatDate(item.date) })
      );
      const title = createEl('h3', { text: item.title });
      const excerpt = createEl('p', { text: item.excerpt });
      const tagList = createEl('div', { className: 'news-card__tags' });
      item.tags.forEach((tagItem) => {
        const tagButton = createEl('button', {
          className: 'tag-btn',
          text: `#${tagItem}`,
          attrs: { type: 'button', 'data-tag': tagItem }
        });
        tagButton.addEventListener('click', () => {
          activeTag = tagItem;
          renderTags();
          renderNews();
        });
        tagList.appendChild(tagButton);
      });
      card.append(meta, title, excerpt, tagList);
      list.appendChild(card);
    });
  };

  renderTags();
  renderNews();
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const formatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  return formatter.format(date);
};
