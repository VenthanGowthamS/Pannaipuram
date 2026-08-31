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
    updateBulletinPost: vi.fn(),
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

/**
 * Admin content editing. The complaint that produced this: an official post
 * could not be edited at all — the public edit route proves ownership with
 * poster_id + phone, and the official account has neither, so fixing a typo
 * meant delete-and-repost.
 *
 * The assertion that matters most here is the PAYLOAD. This dialog sends
 * every field on save, so any field the edit fails to preload is wiped off
 * the post — that is exactly how editing a photo post used to delete the
 * photo (v80). image_url and link_url are checked explicitly for that reason.
 */
describe('Bulletin — editing an existing post', () => {
  const IMG = 'data:image/jpeg;base64,AAAA';
  const officialPost = {
    id: 42,
    title_tamil: 'ஊர் கூட்ட வீடியோ',
    title_english: 'Village meeting video',
    content_tamil: 'கடந்த வார ஊர் கூட்டத்தோட வீடியோ இங்க பாக்கலாம்.',
    content_english: '',
    image_url: IMG,
    link_url: 'https://www.youtube.com/watch?v=abc123',
    status: 'approved',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString(),
    name_tamil: 'admin', phone: '1234567890', like_count: 3,
    is_trusted: true, is_blocked: false, is_official: true, poster_id: 1,
  };

  beforeEach(() => {
    api.getBulletinPosts.mockResolvedValue([officialPost]);
    api.getBulletinPosters.mockResolvedValue([]);
    api.updateBulletinPost.mockResolvedValue({ ...officialPost, title_tamil: 'திருத்திய தலைப்பு' });
  });

  const openEditor = async () => {
    render(<AppHarness />);
    await waitFor(() => expect(screen.getByText('ஊர் கூட்ட வீடியோ')).toBeInTheDocument());
    await act(async () => { screen.getByLabelText(/edit — fix a typo/i).click(); });
  };

  it('opens the dialog prefilled with the post being edited', async () => {
    await openEditor();

    expect(screen.getByText(/Edit post #42/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('ஊர் கூட்ட வீடியோ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://www.youtube.com/watch?v=abc123')).toBeInTheDocument();
  });

  it('sends the edit to updateBulletinPost, preserving the image and link', async () => {
    await openEditor();
    await act(async () => { screen.getByRole('button', { name: /save changes/i }).click(); });

    expect(api.updateBulletinPost).toHaveBeenCalledTimes(1);
    const [id, payload] = api.updateBulletinPost.mock.calls[0];
    expect(id).toBe(42);
    // Both must survive an untouched edit — a blank here silently strips
    // the photo or the link off the live post.
    expect(payload.image_url).toBe(IMG);
    expect(payload.link_url).toBe('https://www.youtube.com/watch?v=abc123');
    expect(payload.title_tamil).toBe('ஊர் கூட்ட வீடியோ');
    // Editing is not moderating: the payload must not carry a status.
    expect(payload.status).toBeUndefined();
    // And it must never go out through the create-a-new-post route.
    expect(api.createOfficialBulletinPost).not.toHaveBeenCalled();
  });

  it('does NOT reload the whole list after saving an edit', async () => {
    await openEditor();
    const before = api.getBulletinPosts.mock.calls.length;

    await act(async () => { screen.getByRole('button', { name: /save changes/i }).click(); });
    await flush();

    // Saving fires onSnackbar -> App re-renders. If that ever re-couples to
    // data loading again, this is where the 8,664-request loop comes back.
    expect(api.getBulletinPosts.mock.calls.length).toBe(before);
  });

  it('offers a link field when composing a new official post', async () => {
    render(<AppHarness />);
    await waitFor(() => expect(screen.getByRole('button', { name: /new official post/i })).toBeInTheDocument());
    await act(async () => { screen.getByRole('button', { name: /new official post/i }).click(); });

    expect(screen.getByText('Post as admin')).toBeInTheDocument();
    expect(screen.getByLabelText(/Link \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publish now/i })).toBeInTheDocument();
  });

  it('hides the edit control from a viewer', async () => {
    render(<Bulletin onSnackbar={() => {}} canEdit={false} />);
    await waitFor(() => expect(screen.getByText('ஊர் கூட்ட வீடியோ')).toBeInTheDocument());
    expect(screen.queryByLabelText(/edit — fix a typo/i)).toBeNull();
  });
});

/**
 * A link typed into a database that has no link_url column yet. The server
 * takes the post and reports link_saved:false; the panel must say so. Before
 * this, it reported plain success and the link silently vanished — which is
 * indistinguishable from a broken feature.
 */
describe('Bulletin — link dropped because the migration has not been run', () => {
  const post = {
    id: 9, title_tamil: 'ஊர் கூட்டம்', title_english: '',
    content_tamil: 'ஞாயிறு காலை 10 மணிக்கு கூட்டம் நடக்கும்.', content_english: '',
    image_url: null, link_url: null, status: 'approved',
    created_at: new Date().toISOString(), expires_at: new Date().toISOString(),
    name_tamil: 'admin', phone: '1234567890', like_count: 0,
    is_trusted: true, is_blocked: false, is_official: true, poster_id: 1,
  };

  function Harness() {
    const [snack, setSnack] = useState(null);
    return (
      <>
        <div data-testid="snack">{snack ? `${snack.severity}:${snack.message}` : ''}</div>
        <Bulletin onSnackbar={(message, severity) => setSnack({ message, severity })} canEdit />
      </>
    );
  }

  beforeEach(() => {
    api.getBulletinPosts.mockResolvedValue([post]);
    api.getBulletinPosters.mockResolvedValue([]);
  });

  it('warns instead of claiming success when the link could not be saved', async () => {
    api.updateBulletinPost.mockResolvedValue({ ...post, link_saved: false });

    render(<Harness />);
    await waitFor(() => expect(screen.getByText('ஊர் கூட்டம்')).toBeInTheDocument());
    await act(async () => { screen.getByLabelText(/edit — fix a typo/i).click(); });
    await act(async () => { screen.getByRole('button', { name: /save changes/i }).click(); });

    const snack = screen.getByTestId('snack').textContent;
    expect(snack).toMatch(/^warning:/);
    expect(snack).toMatch(/migration_bulletin_link\.sql/);
  });

  it('reports plain success once the column exists', async () => {
    api.updateBulletinPost.mockResolvedValue({ ...post, link_url: 'https://example.com/x' });

    render(<Harness />);
    await waitFor(() => expect(screen.getByText('ஊர் கூட்டம்')).toBeInTheDocument());
    await act(async () => { screen.getByLabelText(/edit — fix a typo/i).click(); });
    await act(async () => { screen.getByRole('button', { name: /save changes/i }).click(); });

    const snack = screen.getByTestId('snack').textContent;
    expect(snack).toMatch(/^success:/);
    expect(snack).not.toMatch(/migration/);
  });
});
