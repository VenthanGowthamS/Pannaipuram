/**
 * Local Services admin page.
 *
 * Why this file exists: the category list only had 6 entries, so car wash,
 * e-Sevai centres and logistics were all saved as "Others". These tests pin
 * the new categories, the show/hide switch, clearing a note, and that the
 * page loads its data exactly once on mount (see the Bulletin 8,664-request
 * bug in CLAUDE.md).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LocalServices, { CATEGORIES } from './LocalServices';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    getLocalServices: vi.fn(),
    addLocalService: vi.fn(),
    updateLocalService: vi.fn(),
    deleteLocalService: vi.fn(),
  },
}));

const ROWS = [
  { id: 31, category: 'other', name_tamil: 'கார் வாட்டர் சர்வீஸ்', name_english: '', phone: '9000000001', area_tamil: 'கரியனம்பட்டி', notes_tamil: 'காலை 9 – மாலை 7', display_order: 0, is_active: true },
  { id: 2,  category: 'milk',  name_tamil: 'பால்காரர்', name_english: 'Milk', phone: '9000000002', area_tamil: '', notes_tamil: '', display_order: 0, is_active: false },
];

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

beforeEach(() => {
  vi.clearAllMocks();
  window.scrollTo = vi.fn();
  api.getLocalServices.mockResolvedValue(ROWS);
  api.updateLocalService.mockResolvedValue({});
  api.addLocalService.mockResolvedValue({});
});

describe('Local Services page', () => {
  it('offers the new categories (vehicle, e-Sevai, logistics, grocery) in the API order', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'milk', 'grocery', 'flower', 'vehicle', 'esevai', 'logistics',
      'post', 'plumber', 'electrician', 'carpenter', 'other',
    ]);
    render(<LocalServices onSnackbar={vi.fn()} canEdit />);
    expect(screen.getByText('Vehicle Service')).toBeTruthy();
    expect(screen.getByText('e-Sevai & Net Centre')).toBeTruthy();
    expect(screen.getByText('Parcel & Logistics')).toBeTruthy();
  });

  it('loads the list exactly once on mount', async () => {
    render(<LocalServices onSnackbar={vi.fn()} canEdit />);
    await flush();
    expect(api.getLocalServices).toHaveBeenCalledTimes(1);
  });

  it('lists services in category order (milk before others)', async () => {
    render(<LocalServices onSnackbar={vi.fn()} canEdit />);
    await flush();
    const cells = screen.getAllByRole('row').slice(1).map((r) => r.textContent);
    expect(cells[0]).toMatch(/பால்காரர்/);
    expect(cells[1]).toMatch(/கார் வாட்டர் சர்வீஸ்/);
  });

  it('moving a service to Vehicle and clearing its note sends both in the update', async () => {
    render(<LocalServices onSnackbar={vi.fn()} canEdit />);
    await flush();
    fireEvent.click(screen.getAllByTitle('Edit')[1]);           // the car wash row
    fireEvent.click(screen.getByText('Vehicle Service'));
    fireEvent.change(screen.getByLabelText(/More Details/), { target: { value: '' } });
    fireEvent.click(screen.getByText('Update Service Contact'));
    await flush();
    expect(api.updateLocalService).toHaveBeenCalledTimes(1);
    const [id, payload] = api.updateLocalService.mock.calls[0];
    expect(id).toBe(31);
    expect(payload.category).toBe('vehicle');
    expect(payload.notes_tamil).toBe('');
    expect(payload.area_tamil).toBe('கரியனம்பட்டி');           // untouched fields are kept
  });

  it('the In-app switch hides a shown service and shows a hidden one', async () => {
    render(<LocalServices onSnackbar={vi.fn()} canEdit />);
    await flush();
    fireEvent.click(screen.getByLabelText('Show கார் வாட்டர் சர்வீஸ் in the app'));
    await flush();
    expect(api.updateLocalService).toHaveBeenLastCalledWith(31, { is_active: false });
    fireEvent.click(screen.getByLabelText('Show பால்காரர் in the app'));
    await flush();
    expect(api.updateLocalService).toHaveBeenLastCalledWith(2, { is_active: true });
  });

  it('a viewer cannot flip the switch', async () => {
    render(<LocalServices onSnackbar={vi.fn()} canEdit={false} />);
    await flush();
    expect(screen.getByLabelText('Show கார் வாட்டர் சர்வீஸ் in the app').disabled).toBe(true);
  });
});
