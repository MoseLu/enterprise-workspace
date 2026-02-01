import { http, HttpResponse, type HttpHandler } from 'msw';

export const API_BASE_URL = 'http://localhost:3001';

export const defaultHandlers: HttpHandler[] = [];

export function createSuccessHandler(path: string, payload: unknown) {
  return http.post(`${API_BASE_URL}${path}`, async () =>
    HttpResponse.json({
      code: 2000,
      msg: 'OK',
      data: payload
    })
  );
}

export function createErrorHandler(path: string, code: number, msg: string) {
  return http.post(`${API_BASE_URL}${path}`, async () =>
    HttpResponse.json({
      code,
      msg,
      data: null
    })
  );
}

