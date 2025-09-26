module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:3000'],
      startServerCommand: 'npm run dev',
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
};
