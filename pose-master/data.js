const DEFAULT_FILES = {
  poses: './poses.json',
  rules: './rules.json'
};

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function validateData(posesData, rulesData) {
  if (!Array.isArray(posesData?.poses) || posesData.poses.length === 0) {
    throw new Error('poses.json must contain a non-empty poses array.');
  }

  const poseMap = new Map();
  for (const pose of posesData.poses) {
    if (!pose.id || !pose.name || typeof pose.basePoint !== 'number' || !pose.lane) {
      throw new Error('Each pose requires id, name, basePoint, and lane.');
    }
    poseMap.set(pose.id, pose);
  }

  if (typeof rulesData?.duration !== 'number' || typeof rulesData?.noteCount !== 'number') {
    throw new Error('rules.json must provide numeric duration and noteCount.');
  }

  return {
    poses: posesData.poses,
    poseById: poseMap,
    rules: rulesData
  };
}

export async function loadGameConfig(paths = DEFAULT_FILES) {
  const [posesData, rulesData] = await Promise.all([
    fetchJson(paths.poses),
    fetchJson(paths.rules)
  ]);

  return validateData(posesData, rulesData);
}
