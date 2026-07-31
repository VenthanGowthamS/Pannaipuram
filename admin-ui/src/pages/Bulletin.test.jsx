/**
 * Bulletin admin page — render-loop and failure-path regression tests.
 *
 * Why this file exists: the Bulletin tab once issued ~1,400 requests per
 * SECOND (8,664 in 6s) whenever loading failed. `load` was a useCallback
 * keyed on `onSnackbar`, and the mount effect depended on `[load]`. Because
 * `onSnackbar` is recreated on every App render and is not memoised, a
 * failed load fired a snackbar -> App re-rendered -> new `onSnackbar` ->
 * new `load` -> effect refired -> load failed again, forever.
 *
 * The API test suite could never have caught this: the bug lives entirely
 * in React's render cycle. These tests assert on CALL COUNTS, not markup,
 * so they fail loudly if that loop ever comes back.
 */
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import Bulletin from './Bulletin';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    getBulletinPosts: vi.fn(),
    getBulletinPosters: vi.fn(),
    updateBulletinStatus: vi.fn(),
    deleteBulletinPost: vi.fn(),
    updateBulletinPoster: vi.fn(),
    createOfficialBulletinPost: vi.fn(),
  },
}));

/**
 * Stands in for App.jsx, faithfully reproducing the trait that caused the
 * loop: `onSnackbar` is a NEW function identity on every render, and calling
 * it sets state here, forcing a re-render of the child. If Bulletin ever
 * re-couples its data loading to that identity, the loop returns.
 */
function AppHarness() {
  const [, setSnack] = useState(null);
  const onSnackbar = (message, severity) => setSnack({ message, severity });
  return <Bulletin onSnackbar={onSnackbar} canEdit />;
}

const flush = (ms = 1200) =>
  act(async () => { await new Promise(r => setTimeout(r, ms)); });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Bulletin — failing load', () => {
  it('does NOT loop when the API rejects (the 8,664-request bug)', async () => {
    api.getBulletinPosts.mockRejectedValue(new Error('Bulletin tables not found'));
    api.getBulletinPosters.mockRejectedValue(new Error('Bulletin tables not found'));

    render(<AppHarness />);
    await flush();

    // One load on mount = one call to each endpoint. Anything above a
    // couple means the mount effect is re-firing.
    expect(api.getBulletinPosts.mock.calls.length).toBeLessThanOrEqual(2);
    expect(api.getBulletinPosters.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('shows an in-page error with the server message instead of a snackbar storm', async () => {
    api.getBulletinPosts.mockRejectedValue(
      new Error('Bulletin tables not found — run migration_community_posts.sql in the Supabase SQL Editor')
    );
    api.getBulletinPosters.mockRejectedValue(new Error('Bulletin tables not found'));

    render(<AppHarness />);

    await waitFor(() => expect(screen.getByText(/Couldn't load the bulletin/i)).toBeInTheDocument());
    // Named twice on purpose: once in the raw server message, once in the
    // "run this file" hint box.
    expect(screen.getAllByText(/migration_community_posts\.sql/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});

describe('Bulletin — successful load', () => {
  const posts = [
    {
      id: 1, title_tamil: 'ஊர் கூட்டம்', title_english: 'Village meeting',
      content_tamil: 'ஞாயிறு காலை 10 மணிக்கு கூட்டம் நடக்கும்.',
      status: 'pending', created_at: new Date().toISOString(), expires_at: new Date().toISOString(),
      name_tamil: 'முருகன்', phone: '9876543210', like_count: 0,
      is_trusted: false, is_blocked: false, is_official: false, poster_id: 7,
    },
  ];
  const posters = [
    {
      id: 7, phone: '9876543210', name_tamil: 'முருகன்', name_english: 'Murugan',
      is_trusted: false, is_blocked: false, is_official: false,
      registered_at: new Date().toISOString(), post_count: 1,
    },
  ];

  it('loads each endpoint exactly once on mount', async () => {
    api.getBulletinPosts.mockResolvedValue(posts);
    api.getBulletinPosters.mockResolvedValue(posters);

    render(<AppHarness />);
    await flush();

    expect(api.getBulletinPosts).toHaveBeenCalledTimes(1);
    expect(api.getBulletinPosters).toHaveBeenCalledTimes(1);
  });

  it('renders the post and its pending badge', async () => {
    api.getBulletinPosts.mockResolvedValue(posts);
    api.getBulletinPosters.mockResolvedValue(posters);

    render(<AppHarness />);

    await waitFor(() => expect(screen.getByText('ஊர் கூட்டம்')).toBeInTheDocument());
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText(/awaiting review/i)).toBeInTheDocument();
  });

  it('does not re-fetch after a snackbar-triggered re-render', async () => {
    api.getBulletinPosts.mockResolvedValue(posts);
    api.getBulletinPosters.mockResolvedValue(posters);
    // Moderating fires onSnackbar -> App re-renders. Data must NOT reload
    // as a side effect of that new onSnackbar identity.
    api.updateBulletinStatus.mockResolvedValue({ id: 1, status: 'approved' });

    render(<AppHarness />);
    await waitFor(() => expect(screen.getByText('ஊர் கூட்டம்')).toBeInTheDocument());

    const before = api.getBulletinPosts.mock.calls.length;
    await act(async () => { screen.getByLabelText(/approve/i)?.click(); });
    await flush();

    expect(api.getBulletinPosts.mock.calls.length).toBe(before);
  });
});

describe('Bulletin — official posting is gated on canEdit', () => {
  beforeEach(() => {
    api.getBulletinPosts.mockResolvedValue([]);
    api.getBulletinPosters.mockResolvedValue([]);
  });

  it('offers "New official post" to an editor', async () => {
    render(<Bulletin onSnackbar={() => {}} canEdit />);
    await waitFor(() => expect(screen.getByRole('button', { name: /new official post/i })).toBeInTheDocument());
  });

  it('hides it from a viewer', async () => {
    render(<Bulletin onSnackbar={() => {}} canEdit={false} />);
    await flush(400);
    expect(screen.queryByRole('button', { name: /new official post/i })).toBeNull();
  });
});
