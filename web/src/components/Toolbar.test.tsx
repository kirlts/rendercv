import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toolbar } from './Toolbar';

const globalFetch = vi.fn();
globalThis.fetch = globalFetch as unknown as typeof fetch;

describe('Toolbar Component', () => {
  const mockOnLoadYaml = vi.fn();
  const mockOnDesignChange = vi.fn();
  const mockOnFontChange = vi.fn();
  const mockOnFontSizesChange = vi.fn();
  const mockOnFontWeightsChange = vi.fn();
  const mockOnResetSizes = vi.fn();
  const mockOnSaveDefaults = vi.fn();
  const mockOnLoadDefaultTemplate = vi.fn();
  const mockOnUpdateTemplate = vi.fn();

  const defaultFontSizes = { body: '9pt', name: '28pt', headline: '8pt', connections: '8pt', section_titles: '1.3em', entry_title: '9pt', entry_detail: '9pt' };
  const defaultFontWeights = { body: 400, name: 700, headline: 400, connections: 400, section_titles: 700, entry_title: 700, entry_detail: 400 };
  const defaultSpacing = { body: '0.2cm', name: '0.7cm', headline: '0.7cm', connections: '0.7cm', section_titles: '0.5cm', entry_title: '0.4cm', entry_detail: '0.2cm' };
  const defaultThemeDefaults = { font_size: defaultFontSizes, font_weight: defaultFontWeights, spacing: defaultSpacing };

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/fonts')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ fonts: ['Inter', 'Roboto', 'Source Sans 3'] }) });
      if (url.includes('/api/themes')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ themes: [{ id: 'classic', name: 'Classic' }, { id: 'jpmr', name: 'JPMR (Custom)' }] }) });
      if (url.endsWith('/api/ofertas')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ ofertas: [{ name: 'Oferta 1', filename: 'oferta_1.yaml' }, { name: 'Oferta 2', filename: 'oferta_2.yaml' }] }) });
      if (url.includes('/api/ofertas/oferta_1.yaml')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ content: 'auto loaded html', theme: 'classic' }) });
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
  });

  const renderToolbar = (selectedDesign = 'classic', pdfUrl: string | null = null, selectedFont = 'Source Sans 3', isTemplateModified = false) => {
    return render(
      <Toolbar
        yamlContent="cv: test"
        onLoadYaml={mockOnLoadYaml}
        pdfUrl={pdfUrl}
        selectedDesign={selectedDesign}
        onDesignChange={mockOnDesignChange}
        selectedFont={selectedFont}
        onFontChange={mockOnFontChange}
        fontSizes={defaultFontSizes}
        fontWeights={defaultFontWeights}
        spacing={defaultSpacing}
        themeDefaults={defaultThemeDefaults}
        onFontSizesChange={mockOnFontSizesChange}
        onFontWeightsChange={mockOnFontWeightsChange}
        onSpacingChange={vi.fn()}
        onResetSizes={mockOnResetSizes}
        onSaveDefaults={mockOnSaveDefaults}
        onLoadDefaultTemplate={mockOnLoadDefaultTemplate}
        onUpdateTemplate={mockOnUpdateTemplate}
        isTemplateModified={isTemplateModified}
        templateLang={null}
        onSaveToCVs={vi.fn().mockResolvedValue({ status: 'ok', path: 'CVs/test.pdf' })}
      />
    );
  };

  it('renders design options dynamically', async () => {
    renderToolbar();
    await waitFor(() => {
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('JPMR (Custom)')).toBeInTheDocument();
    });
  });

  it('calls onDesignChange when design is changed', async () => {
    renderToolbar();
    await waitFor(() => { expect(screen.getByText('Classic')).toBeInTheDocument(); });
    const designSelect = screen.getByRole('combobox', { name: /tema/i });
    fireEvent.change(designSelect, { target: { value: 'jpmr' } });
    expect(mockOnDesignChange).toHaveBeenCalledWith('jpmr');
  });

  it('loads and displays ofertas', async () => {
    renderToolbar();
    await waitFor(() => {
      expect(screen.getByText('Oferta 1')).toBeInTheDocument();
      expect(screen.getByText('Oferta 2')).toBeInTheDocument();
    });
  });

  it('renders font picker inside Estilo dropdown', async () => {
    renderToolbar();
    // Open the Estilo dropdown
    fireEvent.click(screen.getByText('Estilo'));
    // Font picker should be inside
    await waitFor(() => {
      expect(screen.getByLabelText('Fuente')).toBeInTheDocument();
    });
  });

  it('renders SizesDropdown (Estilo button)', () => {
    renderToolbar();
    expect(screen.getByText('Estilo')).toBeInTheDocument();
  });

  it('shows "Plantilla base" dropdown button', () => {
    renderToolbar();
    expect(screen.getByText('Plantilla base')).toBeInTheDocument();
  });

  it('shows "Guardar CV" button', () => {
    renderToolbar();
    expect(screen.getByText('Guardar CV')).toBeInTheDocument();
  });

  it('shows "Descargar PDF" button when not template modified', () => {
    renderToolbar('classic', 'blob:http://test');
    expect(screen.getByText('Descargar PDF')).toBeInTheDocument();
  });

  it('does not show Reset button', () => {
    renderToolbar();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });

  it('shows "CV" in the header', () => {
    renderToolbar();
    expect(screen.getByText(/^CV$/)).toBeInTheDocument();
  });

  it('shows "Tema:" label for design selector', async () => {
    renderToolbar();
    await waitFor(() => {
      expect(screen.getByText('Tema:')).toBeInTheDocument();
    });
  });
});
