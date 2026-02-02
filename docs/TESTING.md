# Automated API Test Suite

Minimal but production-grade automated tests for critical API paths using Vitest + Supertest.

## Quick Start

### 1. Setup Test Database

```bash
# Create test database (one-time setup)
chmod +x scripts/setup-test-db.sh
./scripts/setup-test-db.sh
```

This creates a separate PostgreSQL database `opscopilot_test` with the full schema.

### 2. Run Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Interactive UI
npm run test:ui

# With coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.ts                    # Global test setup & teardown
├── helpers/
│   ├── auth.ts                 # Auth utilities (createTestUser, etc.)
│   ├── mocks.ts                # External service mocks (Gmail, OpenAI, Slack)
│   └── fixtures.ts             # Reusable test data
└── api/
    ├── auth.test.ts            # Authentication API tests (9 tests)
    └── automations.test.ts     # Automation API tests (12 tests)
```

## Test Coverage

### Authentication API (`tests/api/auth.test.ts`)

**POST /api/auth/signup**
- ✅ Creates new user account successfully
- ✅ Rejects missing email
- ✅ Rejects short password (<8 chars)
- ✅ Rejects duplicate email
- ✅ Auto-creates organization for new user

**POST /api/auth/signin**
- ✅ Authenticates valid credentials
- ✅ Rejects invalid password
- ✅ Rejects non-existent user

**GET /api/user**
- ✅ Returns user when authenticated
- ✅ Rejects unauthenticated requests

**POST /api/auth/signout**
- ✅ Successfully signs out and destroys session

### Automation API (`tests/api/automations.test.ts`)

**GET /api/automations/templates**
- ✅ Returns list of templates
- ✅ Requires authentication

**POST /api/automations/configs**
- ✅ Creates automation config successfully
- ✅ Rejects config without required fields
- ✅ Requires authentication
- ✅ Isolates configs per organization

**GET /api/automations/configs**
- ✅ Lists user automation configurations

**POST /api/automations/configs/:id/run**
- ✅ Triggers automation run successfully
- ✅ Rejects run for non-existent config
- ✅ Requires authentication
- ✅ Completes run and updates status

**GET /api/runs**
- ✅ Lists automation runs
- ✅ Requires authentication
- ✅ Isolates runs per organization

**GET /api/runs/:id/logs**
- ✅ Retrieves run logs successfully
- ✅ Requires authentication

## Test Design Principles

### 1. **Deterministic**
- No `Math.random()` or `Date.now()` without mocking
- Predictable test data via fixtures
- Fixed wait times for async operations

### 2. **Isolated**
- Fresh database state for each test (via `afterEach` cleanup)
- No test interdependencies
- Separate test database from development

### 3. **Fast**
- Parallel execution where possible
- Lightweight mocks for external services (Gmail, OpenAI, Slack)
- In-memory session store during tests

### 4. **Business-Readable**
- Test names describe user scenarios
- Example: "SME owner can create automation config"
- Clear arrange-act-assert structure

### 5. **Production-Grade**
- Tests actual HTTP endpoints (not just units)
- Validates multi-tenancy isolation
- Checks RBAC enforcement
- Verifies error handling

## Mocked External Services

All external API calls are mocked in `tests/helpers/mocks.ts`:

- **Gmail API**: `mockGmailClient` - Returns sample emails, handles OAuth
- **OpenAI API**: `mockOpenAIClient` - Returns blueprint JSON
- **Slack API**: `mockSlackClient` - Simulates message posting

This ensures tests:
- Run without internet connection
- Don't consume API quotas
- Execute quickly (<50ms per test)
- Don't depend on external service uptime

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: opscopilot_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/opscopilot_test
        run: |
          npm run db:push
          
      - name: Run tests
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/opscopilot_test
          NODE_ENV: test
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Adding New Tests

### 1. Create Test File

```typescript
// tests/api/my-feature.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app';

describe('My Feature API', () => {
  let app: any;
  let authCookies: string[];

  beforeEach(async () => {
    app = await createTestApp();
    // Create authenticated session
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' });
    authCookies = response.headers['set-cookie'];
  });

  it('should do something useful', async () => {
    const response = await request(app)
      .get('/api/my-endpoint')
      .set('Cookie', authCookies)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### 2. Use Helpers

```typescript
import { createTestUser } from '../helpers/auth';
import { getFixture } from '../helpers/fixtures';

// Create user with helpers
const user = await createTestUser({
  email: 'owner@company.com',
  password: 'SecurePass123!',
});

// Use fixture data
const config = getFixture('automationConfigs.emailTriage');
```

### 3. Mock External Services

```typescript
import { mockGmailClient } from '../helpers/mocks';

// Override mock behavior for specific test
mockGmailClient.users.messages.list.mockResolvedValueOnce({
  data: { messages: [] }, // Empty inbox
});
```

## Debugging Tests

### Run Single Test File

```bash
npm test tests/api/auth.test.ts
```

### Run Single Test

```bash
npm test -t "should create new user account"
```

### Enable Verbose Output

```bash
DEBUG=* npm test
```

### Use Vitest UI

```bash
npm run test:ui
```

Opens browser UI at http://localhost:51204 with:
- Test execution timeline
- Code coverage visualization
- File watcher
- Console logs per test

## Troubleshooting

### Database Connection Errors

```bash
# Verify PostgreSQL is running
pg_isready

# Recreate test database
./scripts/setup-test-db.sh

# Check connection string
echo $TEST_DATABASE_URL
```

### Flaky Tests

- Check for `Date.now()` or `Math.random()` usage
- Increase timeout for async operations
- Verify database cleanup in `afterEach`
- Check for race conditions in parallel tests

### Session Issues

Tests handle sessions via cookies:

```typescript
const response = await request(app)
  .post('/api/auth/signup')
  .send({ email: 'test@example.com', password: 'pass' });

const cookies = response.headers['set-cookie'];

// Use cookies in subsequent requests
await request(app)
  .get('/api/user')
  .set('Cookie', cookies);
```

## Performance Benchmarks

Target: **<2s total test execution**

- Auth tests (9 tests): ~500ms
- Automation tests (12 tests): ~1200ms
- Total with setup/teardown: ~1800ms

If tests slow down:
1. Check for unnecessary `setTimeout()` waits
2. Profile with `npm run test:ui`
3. Consider parallelization limits
4. Review database cleanup queries

## Next Steps

- [ ] Add integration tests for WebSocket log streaming
- [ ] Add tests for Gmail OAuth flow
- [ ] Add tests for blueprint generation (with mocked OpenAI)
- [ ] Add tests for RBAC permission checks
- [ ] Add tests for intake wizard flow
- [ ] Set up GitHub Actions CI pipeline
