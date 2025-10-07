const { v4: uuid } = require("uuid");

const templates = [
  { code: "BASE-001", name: "基本設定", description: "システム全体の既定値" },
  { code: "BASE-002", name: "画面テーマ", description: "UI テーマの割り当て" },
  { code: "DEPT-ENG", name: "開発部", description: "エンジニアリング部門", enabled: true },
  { code: "DEPT-HR", name: "人事部", description: "人材・労務管理" },
  { code: "DEPT-SLS", name: "営業部", description: "国内営業", enabled: true },
  { code: "DEPT-MKT", name: "マーケティング", description: "ブランド戦略" },
  { code: "FLAG-JP", name: "国内向け", description: "日本市場向け設定", enabled: true },
  { code: "FLAG-GLOBAL", name: "グローバル", description: "海外向け設定" },
  { code: "WF-APPROVAL", name: "承認フロー標準", description: "標準的な承認フロー" },
  { code: "WF-SHORT", name: "簡易承認", description: "小規模プロジェクト向け" },
  { code: "CAT-OPS", name: "運用", description: "運用カテゴリ" },
  { code: "CAT-RISK", name: "リスク管理", description: "リスク評価カテゴリ" },
  { code: "CAT-QUALITY", name: "品質", description: "品質保証カテゴリ", enabled: true }
];

function createItem(template, index) {
  const now = new Date(Date.now() - index * 86400000).toISOString();
  return {
    id: uuid(),
    code: template.code,
    name: template.name,
    description: template.description || "",
    enabled: template.enabled !== undefined ? template.enabled : true,
    version: 1,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = function seed() {
  return templates.map(createItem);
};
