/**
 * API client + auth token handling.
 * Regression guards for: HTML error pages ("Unexpected token <"), a dead token
 * leaving the panel looking logged-in, and base64url JWT payloads demoting a
 * super_admin to 'viewer'.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// api.js reads localStorage at import time. Node's own experimental global
// localStorage shadows jsdom's (and has no getItem without a backing file), so
// give the module a plain in-memory one BEFORE it loads.
vi.hoisted(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

import api, { SESSION_EXPIRED_EVENT } from './api';
import { decodeToken, isExpired } from './context/AuthContext';

const reply = (status, body, asJson = true) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: asJson ? () => Promise.resolve(body) : () => Promise.reject(new SyntaxError('Unexpected token <')),
  });

beforeEach(() => { localStorage.clear(); api.token = null; });
afterEach(() => { vi.restoreAllMocks(); });

describe('api.request', () => {
  it('unwraps { success, data }', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(200, { success: true, data: [1, 2] })));
    expect(await api.request('GET', '/x')).toEqual([1, 2]);
  });

  it('keeps a falsy payload instead of returning the whole envelope', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(200, { success: true, data: 0 })));
    expect(await api.request('GET', '/x')).toBe(0);
  });

  it('an HTML 502 becomes a readable error, not "Unexpected token <"', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(502, null, false)));
    await expect(api.request('GET', '/x')).rejects.toThrow('Server error (502)');
  });

  it('surfaces the server error text', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(400, { error: 'Phone must be 10-digit' })));
    await expect(api.request('POST', '/x', {})).rejects.toThrow('Phone must be 10-digit');
  });

  it('a 401 on a normal call clears the token and fires the session-expired event', async () => {
    api.setToken('dead.token.here');
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    vi.stubGlobal('fetch', vi.fn(() => reply(401, { error: 'Token expired' })));
    await expect(api.request('GET', '/admin/power/cuts')).rejects.toThrow('Token expired');
    expect(localStorage.getItem('panToken')).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it('a wrong password (401 on login) is a normal error — no logout event', async () => {
    api.setToken('some.token.here');
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    vi.stubGlobal('fetch', vi.fn(() => reply(401, { error: 'Invalid credentials' })));
    await expect(api.request('POST', '/admin/auth/login', {})).rejects.toThrow('Invalid credentials');
    expect(onExpired).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });
});

describe('decodeToken', () => {
  const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = (payload) => `h.${b64url(payload)}.s`;

  it('reads the role from a base64url payload that atob() alone would choke on', () => {
    // '>>>' encodes to 'Pj4+' → '-' after url-safe swap; padding stripped
    const t = jwt({ role: 'super_admin', email: '>>>???@pannaipuram.com', exp: 123 });
    expect(t).toMatch(/[-_]/);
    expect(decodeToken(t)).toEqual({ role: 'super_admin', email: '>>>???@pannaipuram.com', exp: 123 });
  });

  it('handles non-ASCII names', () => {
    expect(decodeToken(jwt({ role: 'admin', email: 'கௌதம்@x.in' })).email).toBe('கௌதம்@x.in');
  });

  it('garbage falls back to viewer', () => {
    expect(decodeToken('not-a-jwt')).toEqual({ role: 'viewer', email: '', exp: null });
  });

  it('isExpired compares the exp claim (seconds) with now', () => {
    expect(isExpired(Math.floor(Date.now() / 1000) - 10)).toBe(true);
    expect(isExpired(Math.floor(Date.now() / 1000) + 3600)).toBe(false);
    expect(isExpired(null)).toBe(false);
  });
});
