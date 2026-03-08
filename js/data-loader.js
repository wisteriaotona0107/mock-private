const readJson = async (path) => {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path} の読み込みに失敗しました。`);
  }
  return res.json();
};

export const loadInitialData = async () => {
  const [categories, cards, settings] = await Promise.all([
    readJson('data/categories.json'),
    readJson('data/cards.json'),
    readJson('data/settings.json')
  ]);
  return { categories, cards, settings };
};
