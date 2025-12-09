export default {
  testEnvironment: 'node',
  // extensionsToTreatAsEsm: ['.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {}, // sin Babel, sin TS
  setupFiles: ['./jest.setup.mjs'],
};
