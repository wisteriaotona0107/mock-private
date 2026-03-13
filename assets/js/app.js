(function () {
  const DATA_PATH = 'assets/data/ai-workflow.json';

  const phaseList = document.getElementById('phase-list');
  const toolList = document.getElementById('tool-list');
  const reviewList = document.getElementById('review-list');
  const securityList = document.getElementById('security-list');
  const statusNode = document.getElementById('status');

  function setStatus(message) {
    statusNode.textContent = message;
  }

  function makeTextTag(tagName, text, className) {
    const node = document.createElement(tagName);
    node.textContent = text;
    if (className) {
      node.className = className;
    }
    return node;
  }

  function renderPhases(phases) {
    phases.forEach(function (phase, index) {
      const li = document.createElement('li');
      li.className = 'phase-item';

      const top = document.createElement('div');
      top.className = 'phase-top';
      top.appendChild(makeTextTag('p', 'Step ' + (index + 1), 'phase-step'));
      top.appendChild(makeTextTag('p', phase.purpose, 'phase-purpose'));

      li.appendChild(top);
      li.appendChild(makeTextTag('h3', phase.name));

      const meta = document.createElement('div');
      meta.className = 'phase-meta';
      meta.appendChild(makeTextTag('span', 'AI: ' + phase.ai_role, 'badge'));
      meta.appendChild(makeTextTag('span', '人: ' + phase.human_point, 'badge'));
      li.appendChild(meta);

      phaseList.appendChild(li);
    });
  }

  function renderTools(tools) {
    tools.forEach(function (tool) {
      const li = document.createElement('li');
      li.className = 'card-item';
      li.appendChild(makeTextTag('h3', tool.name));
      li.appendChild(makeTextTag('p', tool.role));
      toolList.appendChild(li);
    });
  }

  function renderNotes(items, container) {
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.className = 'note-item';
      li.appendChild(makeTextTag('p', item));
      container.appendChild(li);
    });
  }

  function isValidData(data) {
    return (
      data &&
      Array.isArray(data.phases) &&
      Array.isArray(data.tools) &&
      Array.isArray(data.review_points) &&
      Array.isArray(data.security_notes)
    );
  }

  fetch(DATA_PATH)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('データ読込に失敗しました');
      }
      return response.json();
    })
    .then(function (data) {
      if (!isValidData(data)) {
        throw new Error('データ形式が不正です');
      }
      renderPhases(data.phases);
      renderTools(data.tools);
      renderNotes(data.review_points, reviewList);
      renderNotes(data.security_notes, securityList);
      setStatus('');
    })
    .catch(function (error) {
      console.error(error);
      setStatus('表示データを取得できませんでした。時間をおいて再読み込みしてください。');
    });
})();
