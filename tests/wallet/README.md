# Wallet Custodial Testing Suite

This directory contains comprehensive tests for the Fractea wallet custodial system, covering various aspects of the implementation from unit tests to integration and UI tests.

## Test Structure

The testing suite is organized as follows:

- `wallet.core.test.js`: Tests the core functionality of the wallet system including wallet generation, login, token operations, and the full user flow.
- `wallet.error.test.js`: Focuses on error handling and edge cases to ensure the system handles failures gracefully.
- `wallet.integration.test.js`: Tests the integration between the wallet functionality and API endpoints, using mocked API responses.
- `wallet.ui.test.js`: Tests the UI components related to the wallet system using mocked components.
- `jest.setup.js`: Contains setup code and global mocks for the Jest testing environment.

## Mock Design

We use several mock strategies:

1. **Component Mocks**: Instead of importing real React components, we use simplified mock implementations that capture the essential elements needed for testing.
2. **API Mocks**: We mock the `fetch` API to simulate backend interactions without requiring a real backend.
3. **Blockchain Mocks**: We mock all blockchain operations to avoid actual blockchain interactions during tests.
4. **Store Mocks**: We use a mock store object to simulate user data persistence instead of using localStorage, which avoids issues with Jest's limitations.

## Running Tests

To run all wallet tests:
```bash
npm run test:wallet
```

To run specific test files:
```bash
npm run test:wallet:core     # Core functionality
npm run test:wallet:error    # Error handling
npm run test:wallet:ui       # UI tests
npm run test:wallet:integration  # Integration tests
```

To run tests with coverage:
```bash
npm run test:wallet:coverage
```

## Test Coverage

The tests cover the following aspects:

1. **Wallet Generation & Management**
   - Wallet creation
   - User login
   - User data persistence

2. **Token Operations**
   - Getting token balances
   - Depositing tokens
   - Withdrawing tokens
   - Transferring tokens (both internal and external)

3. **Property Operations**
   - Fetching property details
   - Getting user balances for properties
   - Getting claimable rent

4. **Error Handling**
   - Input validation
   - Network errors
   - Insufficient balances
   - Rate limiting
   - Minimum withdrawal thresholds
   - KYC limits
   - API errors

5. **UI Testing**
   - Dashboard rendering
   - Wallet actions (deposit, withdraw, transfer)
   - Educational content

## Continuous Improvement

The testing strategy focuses on:

1. **Increased Coverage**: We aim to maintain high test coverage to ensure all critical paths are tested.
2. **Robust Error Handling**: We extensively test error conditions to ensure graceful failures.
3. **Real-world Scenarios**: We test full user flows to simulate real-world usage.
4. **Mock Optimization**: Our mocks are designed to be simple yet sufficient for effective testing.

## Future Enhancements

1. Add end-to-end tests with Cypress for full user flow testing
2. Implement performance tests for critical operations
3. Add load testing for wallet operations under high volume
4. Expand browser compatibility testing 