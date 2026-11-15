/**
 * PWA Stats — "my phones can delete any சங்கமம் post".
 *
 * The admin marks their own phones here; such a phone then sees a 🗑️ on every
 * post in the app. Tests pin the add-by-Device-ID box, the per-row switch,
 * the remove chip, and that the page fetches once on mount.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PwaStats from './PwaStats';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    getPwaStats: vi.fn(),
    setPwaVisitorLabel: vi.fn(),
    setPwaModerator: vi.fn(),
  },
}));

const STATS = {
  totals: { installs_today: 1 },
  daily: [],
  monthly: [],
  recent: [
    { visitor_id: 'v-mine-12345678', label: 'My Pixel', visit_count: 9, can_moderate: true, user_agent: 'Android' },
    { visitor_id: 'v-someone-87654321', label: null, visit_count: 2, can_moderate: false, user_agent: 'iPhone' },
  ],
  moderators: [{ visitor_id: 'v-mine-12345678', label: 'My Pixel' }],
  moderation_ready: true,
};

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

beforeEach(() => {
  vi.clearAllMocks();
  api.getPwaStats.mockResolvedValue(STATS);
  api.setPwaModerator.mockResolvedValue({});
});

describe('PWA Stats — admin phones', () => {
  it('fetches the stats exactly once on mount', async () => {
    render(<PwaStats onSnackbar={vi.fn()} canEdit />);
    await flush();
    expect(api.getPwaStats).toHaveBeenCalledTimes(1);
  });

  it('lists the phones that can delete posts', async () => {
    render(<PwaStats onSnackbar={vi.fn()} canEdit />);
    await flush();
    expect(screen.getByText('🛡 My Pixel')).toBeTruthy();
  });

  it('adds a phone by pasting its Device ID', async () => {
    render(<PwaStats onSnackbar={vi.fn()} canEdit />);
    await flush();
    fireEvent.change(screen.getByLabelText('Device ID'), { target: { value: '  v-newphone-1234abcd ' } });
    fireEvent.click(screen.getByText('Allow deleting'));
    await flush();
    expect(api.setPwaModerator).toHaveBeenCalledWith('v-newphone-1234abcd', true);
  });

  it('refuses a malformed Device ID without calling the API', async () => {
    const snack = vi.fn();
    render(<PwaStats onSnackbar={snack} canEdit />);
    await flush();
    fireEvent.change(screen.getByLabelText('Device ID'), { target: { value: 'not an id!' } });
    fireEvent.click(screen.getByText('Allow deleting'));
    await flush();
    expect(api.setPwaModerator).not.toHaveBeenCalled();
    expect(snack).toHaveBeenCalledWith(expect.stringMatching(/About/), 'warning');
  });

  it('the row switch turns the right on for another device', async () => {
    render(<PwaStats onSnackbar={vi.fn()} canEdit />);
    await flush();
    fireEvent.click(screen.getByLabelText('Can delete posts: v-someone-87654321'));
    await flush();
    expect(api.setPwaModerator).toHaveBeenCalledWith('v-someone-87654321', true);
  });

  it('a viewer sees the list but cannot change it', async () => {
    render(<PwaStats onSnackbar={vi.fn()} canEdit={false} />);
    await flush();
    expect(screen.queryByText('Allow deleting')).toBeNull();
    expect(screen.getByLabelText('Can delete posts: My Pixel').disabled).toBe(true);
  });
});
