const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setupTests.ts'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/app/(components)/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1'
  }
};

module.exports = createJestConfig(customJestConfig);
