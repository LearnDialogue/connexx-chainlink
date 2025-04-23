import { vi } from 'vitest';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';

// 1) Load Apollo Client dev and error messages for better debugging in tests
if (process.env.NODE_ENV !== 'production') {
  loadDevMessages();
  loadErrorMessages();
}

// 2) Mock AWS SDK calls (e.g., S3) so tests don't require real AWS credentials
vi.mock('aws-sdk', () => {
  return {
    S3: class {
      getObject(params, callback) {
        callback(null, { Body: 'mocked-data' });
      }
    },
  };
});