/**
 * API base detection — the admin panel is served from two places:
 * Cloudflare Pages (admin.pannaipuram.com, static, separate origin) and
 * Render (/admin/v2/, same origin as the API). Get this wrong and every
 * admin call on Pages hits the static site and 404s.
 */
import { describe, it, expect } from 'vitest';
import { apiBaseFor } from './apiBase';

describe('apiBaseFor', () => {
  it('Cloudflare Pages custom domain → API host', () => {
    expect(apiBaseFor('admin.pannaipuram.com')).toBe('https://api.pannaipuram.com');
  });
  it('Cloudflare Pages project + preview URLs → API host', () => {
    expect(apiBaseFor('pannaipuram-admin.pages.dev')).toBe('https://api.pannaipuram.com');
    expect(apiBaseFor('abc123.pannaipuram-admin.pages.dev')).toBe('https://api.pannaipuram.com');
  });
  it('Render fallback and local dev stay same-origin', () => {
    expect(apiBaseFor('api.pannaipuram.com')).toBe('');
    expect(apiBaseFor('pannaipuram-api.onrender.com')).toBe('');
    expect(apiBaseFor('localhost')).toBe('');
    expect(apiBaseFor('')).toBe('');
  });
});
