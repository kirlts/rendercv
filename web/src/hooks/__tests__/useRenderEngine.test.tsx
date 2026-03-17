import { renderHook, act } from '@testing-library/react';
import { useRenderEngine } from '../useRenderEngine';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useRenderEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: () => Promise.resolve(new Blob(['pdf-data'])),
    }) as unknown as typeof window.fetch;
    window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-uuid');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('debounces the API call and eventually renders', async () => {
    const { rerender } = renderHook(
      ({ yaml, design }) => useRenderEngine(yaml, design, 500),
      { initialProps: { yaml: 'cv: initial', design: 'faang_software_engineer' } }
    );

    await act(async () => {
      vi.runAllTimers();
      // wait for microtasks to flush fetch
      await Promise.resolve();
    });

    expect(window.fetch).toHaveBeenCalledTimes(1);

    rerender({ yaml: 'cv: updated 1', design: 'classic' });
    rerender({ yaml: 'cv: updated 2', design: 'classic' });

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(window.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(window.fetch).toHaveBeenCalledTimes(2);
  });
});
