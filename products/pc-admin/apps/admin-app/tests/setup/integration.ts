import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { defaultHandlers, API_BASE_URL } from '../integration/msw/handlers';

export const server = setupServer(...defaultHandlers);
export { API_BASE_URL };

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

