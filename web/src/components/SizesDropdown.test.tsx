import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SizesDropdown } from './SizesDropdown';

describe('SizesDropdown', () => {
  const defaultSizes = {
    body: '9pt',
    name: '28pt',
    headline: '8pt',
    connections: '8pt',
    section_titles: '1.3em',
    entry_title: '9pt',
    entry_detail: '9pt',
  };

  const defaultSpacing = {
    body: '0.2cm',
    name: '0.7cm',
    headline: '0.7cm',
    connections: '0.7cm',
    section_titles: '0.5cm',
    entry_title: '0.4cm',
    entry_detail: '0.2cm',
  };

  const defaultWeights = {
    body: 400,
    name: 700,
    headline: 400,
    connections: 400,
    section_titles: 700,
    entry_title: 700,
    entry_detail: 400,
  };

  const mockOnFontSizesChange = vi.fn();
  const mockOnFontWeightsChange = vi.fn();
  const mockOnSpacingChange = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnFontChange = vi.fn();

  const testFonts = ['Inter', 'Roboto', 'Source Sans 3'];

  beforeEach(() => { vi.clearAllMocks(); });

  const renderDropdown = (fontSizes = defaultSizes, fontWeights = defaultWeights, spacing = defaultSpacing) => {
    return render(
      <SizesDropdown
        fontSizes={fontSizes}
        fontWeights={fontWeights}
        spacing={spacing}
        themeDefaults={{ font_size: defaultSizes, font_weight: defaultWeights, spacing: defaultSpacing }}
        onFontSizesChange={mockOnFontSizesChange}
        onFontWeightsChange={mockOnFontWeightsChange}
        onSpacingChange={mockOnSpacingChange}
        onReset={mockOnReset}
        onSave={mockOnSave}
        fonts={testFonts}
        selectedFont="Source Sans 3"
        onFontChange={mockOnFontChange}
      />
    );
  };

  it('renders the Estilo button', () => {
    renderDropdown();
    expect(screen.getByText('Estilo')).toBeInTheDocument();
  });

  it('dropdown is closed by default', () => {
    renderDropdown();
    expect(screen.queryByText('Cuerpo')).not.toBeInTheDocument();
  });

  it('opens dropdown with all field labels when clicked', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Titular')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
    expect(screen.getByText('Secciones')).toBeInTheDocument();
  });

  it('shows font picker with "Fuente:" label when opened', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    expect(screen.getByText('Fuente:')).toBeInTheDocument();
    const fontSelect = screen.getByLabelText('Fuente');
    expect(fontSelect).toBeInTheDocument();
    expect(fontSelect).toHaveValue('Source Sans 3');
  });

  it('calls onFontChange when font is changed', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const fontSelect = screen.getByLabelText('Fuente');
    fireEvent.change(fontSelect, { target: { value: 'Roboto' } });
    expect(mockOnFontChange).toHaveBeenCalledWith('Roboto');
  });

  it('shows tamaño, peso and espaciado labels for each field', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const tamanoLabels = screen.getAllByText('tamaño');
    const pesoLabels = screen.getAllByText('peso');
    const espaciadoLabels = screen.getAllByText('espaciado');
    expect(tamanoLabels).toHaveLength(7);
    expect(pesoLabels).toHaveLength(7);
    expect(espaciadoLabels).toHaveLength(7);
  });

  it('calls onFontSizesChange when a size slider is moved', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const bodySlider = screen.getByLabelText('Cuerpo');
    fireEvent.change(bodySlider, { target: { value: '10' } });
    expect(mockOnFontSizesChange).toHaveBeenCalledWith(
      expect.objectContaining({ body: '10pt' })
    );
  });

  it('calls onFontWeightsChange when a weight slider is moved', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const nameWeightSlider = screen.getByLabelText('Peso Nombre');
    fireEvent.change(nameWeightSlider, { target: { value: '500' } });
    expect(mockOnFontWeightsChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 500 })
    );
  });

  it('calls onReset when Reiniciar is clicked', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    fireEvent.click(screen.getByText('Reiniciar'));
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('calls onSave when Guardar is clicked', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    fireEvent.click(screen.getByText('Guardar'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Cuerpo')).not.toBeInTheDocument();
  });

  it('makes value editable when clicked', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const valueSpan = screen.getAllByText('9pt')[0];
    fireEvent.click(valueSpan);
    const input = screen.getByLabelText('editable value');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('9pt');
  });

  it('calls onSpacingChange when a spacing slider is moved', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    const bodySpacingSlider = screen.getByLabelText('Espaciado Cuerpo');
    fireEvent.change(bodySpacingSlider, { target: { value: '0.8' } });
    expect(mockOnSpacingChange).toHaveBeenCalledWith(
      expect.objectContaining({ body: '0.8cm' })
    );
  });

  it('shows spacing value next to each spacing slider', () => {
    renderDropdown();
    fireEvent.click(screen.getByText('Estilo'));
    // body and entry_detail spacing both default to 0.2cm
    const spacingValues = screen.getAllByText('0.2cm');
    expect(spacingValues.length).toBeGreaterThanOrEqual(1);
  });
});
