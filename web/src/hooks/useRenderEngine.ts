import { useState, useEffect } from 'react';

export type RenderState = 'idle' | 'rendering' | 'success' | 'error';

interface RenderError {
  type: 'validation' | 'user' | 'unknown';
  details: unknown;
}

// Maps spacing UI keys to their YAML design sub-object and field name
const SPACING_YAML_MAP: Record<string, { section: string; field: string }> = {
  body: { section: 'typography', field: 'line_spacing' },
  name: { section: 'header', field: 'space_below_name' },
  headline: { section: 'header', field: 'space_below_headline' },
  connections: { section: 'header', field: 'space_below_connections' },
  section_titles: { section: 'section_titles', field: 'space_above' },
  entry_title: { section: 'sections', field: 'space_between_regular_entries' },
  entry_detail: { section: 'sections', field: 'space_between_text_based_entries' },
};

export function useRenderEngine(yaml: string, design: string, font: string, fontSizes: Record<string, string>, fontWeights: Record<string, number>, spacing: Record<string, string>, debounceMs: number = 500) {
  const [debouncedYaml, setDebouncedYaml] = useState(yaml);
  const [debouncedDesign, setDebouncedDesign] = useState(design);
  const [debouncedFont, setDebouncedFont] = useState(font);
  const [debouncedFontSizes, setDebouncedFontSizes] = useState(fontSizes);
  const [debouncedFontWeights, setDebouncedFontWeights] = useState(fontWeights);
  const [debouncedSpacing, setDebouncedSpacing] = useState(spacing);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderState>('idle');
  const [error, setError] = useState<RenderError | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYaml(yaml);
      setDebouncedDesign(design);
      setDebouncedFont(font);
      setDebouncedFontSizes(fontSizes);
      setDebouncedFontWeights(fontWeights);
      setDebouncedSpacing(spacing);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [yaml, design, font, fontSizes, fontWeights, spacing, debounceMs]);

  useEffect(() => {
    if (!debouncedYaml) return;

    const controller = new AbortController();

    const renderPdf = async () => {
      setStatus('rendering');

      // Inject font_family, font_weight, font_size, and spacing into YAML
      let finalYaml = debouncedYaml;
      try {
        const lines = finalYaml.split('\n');
        // Remove any existing font_family, font_weight, font_size, and design sub-blocks
        const filtered: string[] = [];
        let skipBlock = false;
        for (const line of lines) {
          if (/^\s+(font_size|font_weight)\s*:/.test(line) && /^\s{4}/.test(line)) {
            skipBlock = true;
            continue;
          }
          if (skipBlock) {
            if (/^\s{6,}\S/.test(line)) {
              continue;
            }
            skipBlock = false;
          }
          if (/^\s+font_family\s*:/.test(line)) continue;
          // Remove existing spacing-related design sub-blocks
          if (/^\s{2}(header|section_titles|sections)\s*:/.test(line) && !/^\s{2}(header|section_titles|sections)\s*:\s*\S/.test(line)) {
            // Check if this is under design: — skip the block
            const prevNonEmpty = filtered.filter(l => l.trim()).slice(-1)[0];
            if (prevNonEmpty && /^design\s*:|^\s+theme\s*:|^\s+typography\s*:/.test(prevNonEmpty)) {
              skipBlock = true;
              continue;
            }
          }
          filtered.push(line);
        }

        // Find or create the design block
        const designIdx = filtered.findIndex((l: string) => /^design\s*:/.test(l));
        if (designIdx >= 0) {
          let typographyIdx = -1;
          for (let i = designIdx + 1; i < filtered.length; i++) {
            if (/^\S/.test(filtered[i]) && i > designIdx) break;
            if (/^\s+typography\s*:/.test(filtered[i])) {
              typographyIdx = i;
              break;
            }
          }
          const insertLines: string[] = [];
          if (debouncedFont) insertLines.push(`    font_family: "${debouncedFont}"`);
          // Inject font_size block
          if (debouncedFontSizes && Object.keys(debouncedFontSizes).length > 0) {
            insertLines.push(`    font_size:`);
            for (const [key, value] of Object.entries(debouncedFontSizes)) {
              insertLines.push(`      ${key}: ${value}`);
            }
          }
          // Inject font_weight block
          if (debouncedFontWeights && Object.keys(debouncedFontWeights).length > 0) {
            insertLines.push(`    font_weight:`);
            for (const [key, value] of Object.entries(debouncedFontWeights)) {
              insertLines.push(`      ${key}: ${value}`);
            }
          }

          if (typographyIdx >= 0) {
            filtered.splice(typographyIdx + 1, 0, ...insertLines);
          } else {
            filtered.splice(designIdx + 1, 0, `  typography:`, ...insertLines);
          }

          // Inject spacing into design sub-objects (header, section_titles, sections)
          if (debouncedSpacing && Object.keys(debouncedSpacing).length > 0) {
            // Group spacing by design section
            const bySection: Record<string, Record<string, string>> = {};
            for (const [key, value] of Object.entries(debouncedSpacing)) {
              const map = SPACING_YAML_MAP[key];
              if (map) {
                // typography.line_spacing is already handled via the typography block above
                if (map.section === 'typography') {
                  // Inject line_spacing under typography
                  const typoIdx = filtered.findIndex((l: string) => /^\s+typography\s*:/.test(l));
                  if (typoIdx >= 0) {
                    filtered.splice(typoIdx + 1, 0, `    ${map.field}: ${value}`);
                  }
                } else {
                  if (!bySection[map.section]) bySection[map.section] = {};
                  bySection[map.section][map.field] = value;
                }
              }
            }
            // Find the design block end to insert sub-objects
            const dIdx = filtered.findIndex((l: string) => /^design\s*:/.test(l));
            if (dIdx >= 0) {
              let insertAt = dIdx + 1;
              // Find the end of the design block
              for (let i = dIdx + 1; i < filtered.length; i++) {
                if (/^\S/.test(filtered[i]) && i > dIdx) break;
                insertAt = i + 1;
              }
              const spacingLines: string[] = [];
              for (const [section, fields] of Object.entries(bySection)) {
                spacingLines.push(`  ${section}:`);
                for (const [field, value] of Object.entries(fields)) {
                  spacingLines.push(`    ${field}: ${value}`);
                }
              }
              filtered.splice(insertAt, 0, ...spacingLines);
            }
          }
        } else {
          const insertLines: string[] = [`design:`, `  typography:`];
          if (debouncedFont) insertLines.push(`    font_family: "${debouncedFont}"`);
          if (debouncedFontSizes && Object.keys(debouncedFontSizes).length > 0) {
            insertLines.push(`    font_size:`);
            for (const [key, value] of Object.entries(debouncedFontSizes)) {
              insertLines.push(`      ${key}: ${value}`);
            }
          }
          if (debouncedFontWeights && Object.keys(debouncedFontWeights).length > 0) {
            insertLines.push(`    font_weight:`);
            for (const [key, value] of Object.entries(debouncedFontWeights)) {
              insertLines.push(`      ${key}: ${value}`);
            }
          }
          filtered.push(...insertLines);
        }
        finalYaml = filtered.join('\n');
      } catch {
        // If injection fails, send as-is
      }

      try {
        const response = await fetch('http://localhost:8000/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yaml: finalYaml, design: debouncedDesign }),
          signal: controller.signal
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          setError({
            type: errData.error || 'unknown',
            details: errData.details
          });
          setStatus('error');
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const blob = await response.blob();
        const newUrl = URL.createObjectURL(blob);

        setPdfUrl((prevUrl) => {
          if (prevUrl) {
            setTimeout(() => URL.revokeObjectURL(prevUrl), 15000);
          }
          return newUrl;
        });

        setStatus('success');
        setError(null);

      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;

        setError({
          type: 'unknown',
          details: (err as Error).message || 'An unknown error occurred'
        });
        setStatus('error');
      }
    };

    renderPdf();

    return () => {
      controller.abort();
    };
  }, [debouncedYaml, debouncedDesign, debouncedFont, debouncedFontSizes, debouncedFontWeights, debouncedSpacing]);

  return { pdfUrl, status, error };
}
