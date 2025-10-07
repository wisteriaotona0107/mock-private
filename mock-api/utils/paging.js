const TOKEN_PREFIX = "MMTK";

function toNextToken(key) {
  if (!key || typeof key.index !== "number") {
    return null;
  }
  const payload = JSON.stringify({ index: key.index, prefix: TOKEN_PREFIX });
  return Buffer.from(payload).toString("base64");
}

function fromNextToken(token) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    if (parsed.prefix !== TOKEN_PREFIX) return null;
    if (typeof parsed.index !== "number" || parsed.index < 0) return null;
    return { index: parsed.index };
  } catch (error) {
    return null;
  }
}

function sliceWithToken(array, token, limit) {
  const startIndex = token?.index ?? 0;
  const safeStart = Number.isFinite(startIndex) && startIndex >= 0 ? startIndex : 0;
  const slice = array.slice(safeStart, safeStart + limit);
  const nextIndex = safeStart + slice.length;
  const nextKey = nextIndex < array.length ? { index: nextIndex } : null;
  return { slice, nextKey };
}

module.exports = {
  toNextToken,
  fromNextToken,
  sliceWithToken
};
