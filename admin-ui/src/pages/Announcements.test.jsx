/**
 * Announcements admin page — expiry timezone regression tests.
 *
 * Why this file exists: the "Expires At" box is a datetime-local input,
 * which has no timezone. It used to be sent bare ("2026-10-05T23:59"), so
 * Postgres read it in the DB session's zone (UTC / Singapore) instead of
 * IST — announcements expired hours late (or early). Opening Edit also
 * sliced the UTC ISO string straight into the box, so every Edit+Save
 * shifted the expiry again. These tests pin the IST round trip.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Announcements, { istInputFromIso, isoFromIstInput } from './Announcements';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    getAnnouncements: vi.fn(),
    addAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
    deleteAnnouncement: vi.fn(),
  },
}));

// 23:59 IST on 5 Oct 2026 === 18:29 UTC
const ITEM = {
  id: 7,
  message_tamil: 'நாளை கரண்ட் கட்',
  message_english: 'Power cut tomorrow',
  type: 'info',
  priority: 0,
  is_active: true,
  expires_at: '2026-10-05T18:29:00.000Z',
};

const flush = () => act(async () => { await new Promise(r => setTimeout(r, 0)); });

beforeEach(() => {
  vi.clearAllMocks();
  window.scrollTo = vi.fn();   // handleEdit scrolls to the form; jsdom has no scrollTo
  api.updateAnnouncement.mockResolvedValue({});
  api.addAnnouncement.mockResolvedValue({});
});

describe('IST helpers', () => {
  it('shows a stored UTC instant as IST wall-clock time', () => {
    expect(istInputFromIso('2026-10-05T18:29:00.000Z')).toBe('2026-10-05T23:59');
  });
  it('sends the input with an explicit +05:30 offset', () => {
    expect(isoFromIstInput('2026-10-05T23:59')).toBe('2026-10-05T23:59:00+05:30');
    expect(Date.parse(isoFromIstInput('2026-10-05T23:59'))).toBe(Date.parse(ITEM.expires_at));
  });
  it('empty input means no expiry', () => {
    expect(isoFromIstInput('')).toBeNull();
    expect(istInputFromIso(null)).toBe('');
  });
});

describe('Announcements page', () => {
  it('loads once on mount', async () => {
    api.getAnnouncements.mockResolvedValue([ITEM]);
    render(<Announcements onSnackbar={() => {}} canEdit />);
    await flush();
    expect(api.getAnnouncements).toHaveBeenCalledTimes(1);
  });

  it('Edit shows the expiry in IST and an unchanged save keeps the SAME instant', async () => {
    api.getAnnouncements.mockResolvedValue([ITEM]);
    render(<Announcements onSnackbar={() => {}} canEdit />);
    await screen.findByText(ITEM.message_tamil);

    fireEvent.click(screen.getByTitle('Edit'));
    expect(screen.getByLabelText(/Expires At \(IST\)/).value).toBe('2026-10-05T23:59');

    fireEvent.click(screen.getByText('Update Announcement'));
    await waitFor(() => expect(api.updateAnnouncement).toHaveBeenCalledTimes(1));
    const [, payload] = api.updateAnnouncement.mock.calls[0];
    expect(payload.expires_at).toBe('2026-10-05T23:59:00+05:30');
    expect(Date.parse(payload.expires_at)).toBe(Date.parse(ITEM.expires_at));
  });

  it('clearing the expiry on Edit sends null (no expiry)', async () => {
    api.getAnnouncements.mockResolvedValue([ITEM]);
    render(<Announcements onSnackbar={() => {}} canEdit />);
    await screen.findByText(ITEM.message_tamil);

    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.change(screen.getByLabelText(/Expires At \(IST\)/), { target: { value: '' } });
    fireEvent.click(screen.getByText('Update Announcement'));
    await waitFor(() => expect(api.updateAnnouncement).toHaveBeenCalledTimes(1));
    expect(api.updateAnnouncement.mock.calls[0][1]).toHaveProperty('expires_at', null);
  });

  it('marks an expired announcement so it does not look live', async () => {
    const past = { ...ITEM, id: 1, message_tamil: 'பழையது', expires_at: '2020-01-01T00:00:00.000Z' };
    const future = { ...ITEM, id: 2, message_tamil: 'புதியது', expires_at: '2099-01-01T00:00:00.000Z' };
    api.getAnnouncements.mockResolvedValue([past, future]);
    render(<Announcements onSnackbar={() => {}} canEdit />);
    await screen.findByText('பழையது');
    expect(screen.getAllByText('Expired · hidden')).toHaveLength(1);
  });
});
