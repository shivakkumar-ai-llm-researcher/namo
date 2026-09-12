/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  moduleNameMapper: {
    // Mock native modules that cannot run in Node
    '^expo-file-system.*$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native-get-random-values$': '<rootDir>/__mocks__/react-native-get-random-values.js',
    '^base64-arraybuffer$': '<rootDir>/__mocks__/base64-arraybuffer.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
