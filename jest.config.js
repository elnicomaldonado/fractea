module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js?(x)'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // A list of paths to modules that run code to configure or set up the testing framework
  setupFilesAfterEnv: ['<rootDir>/tests/wallet/jest.setup.js'],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings that are matched against all file paths before executing tests
  collectCoverageFrom: [
    'frontend/src/utils/blockchain.js',
    'frontend/src/components/WalletActions.jsx',
    'frontend/src/components/WalletEducation.jsx',
    'frontend/src/components/Dashboard.jsx'
  ],
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // Global timeout for tests
  testTimeout: 30000,
  
  // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/mocks/fileMock.js',
    '^../../frontend/src/components/Dashboard$': '<rootDir>/tests/mocks/componentMocks.js',
    '^../../frontend/src/components/WalletActions$': '<rootDir>/tests/mocks/componentMocks.js',
    '^../../frontend/src/components/WalletEducation$': '<rootDir>/tests/mocks/componentMocks.js',
    '^../../frontend/src/components/PropertyCard$': '<rootDir>/tests/mocks/componentMocks.js'
  },
  
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(ethers|@ethersproject)/)'
  ],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true
}; 