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

  const defaultFontSizes = { body: '9pt', name: '28pt', headline: '8pt', connections: '8pt', section_titles: '1.3em' };
  const defaultFontWeights = { body: 400, name: 700, headline: 400, connections: 400, section_titles: 700 };

  it('debounces the API call and eventually renders', async () => {
    const { rerender } = renderHook(
      ({ yaml, design }) => useRenderEngine(yaml, design, 'Source Sans 3', defaultFontSizes, defaultFontWeights, 500),
      { initialProps: { yaml: 'cv: initial', design: 'classic' } }
    );

    await act(async () => {
      vi.runAllTimers();
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

  it('injects font_size and font_weight into the YAML body', async () => {
    renderHook(() =>
      useRenderEngine('cv:\n  name: Test', 'jpmr', 'Source Sans 3', { body: '10pt', name: '30pt' }, { body: 400, name: 800 }, 500)
    );

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve();
    });

    expect(window.fetch).toHaveBeenCalled();
    const lastCall = (window.fetch as ReturnType<typeof vi.fn>).mock.calls.at(-1);
    const callBody = JSON.parse(lastCall![1].body);
    expect(callBody.yaml).toContain('font_size:');
    expect(callBody.yaml).toContain('body: 10pt');
    expect(callBody.yaml).toContain('name: 30pt');
    expect(callBody.yaml).toContain('font_weight:');
    expect(callBody.yaml).toContain('body: 400');
    expect(callBody.yaml).toContain('name: 800');
  });
});
