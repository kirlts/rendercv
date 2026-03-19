import yaml from 'js-yaml';
import { getThemeDefaults, DesignTheme } from './themeRegistry';

interface CV {
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  sections?: Record<string, any[]>;
}

interface RenderCVData {
  cv?: CV;
  locale?: { language?: string };
  design?: DesignTheme;
}

export function generateTypstSource(yamlString: string): string {
  let data: RenderCVData;
  try {
    const doc = yaml.load(yamlString);
    if (!doc || typeof doc !== 'object') {
      throw new Error('Invalid YAML format');
    }
    data = doc as RenderCVData;
  } catch (e: any) {
    throw new Error(`YAML Parse Error: ${e.message}`);
  }

  if (!data.cv) {
    throw new Error('YAML must contain a "cv" object');
  }

  const cv = data.cv;
  const design = data.design || { theme: 'classic' };
  const themeDefaults = getThemeDefaults(design.theme);

  const accentColor = design.colors?.name || themeDefaults.colors?.name || 'rgb(0, 79, 144)';
  const fontFam = design.typography?.font_family || themeDefaults.typography?.font_family || 'Source Sans 3';

  let typst = `#import "@preview/rendercv:0.2.0": *\n\n`;
  typst += `#show: rendercv.with(\n`;
  if (cv.name) typst += `  name: "${cv.name}",\n`;
  typst += `  theme: "${design.theme}",\n`;
  typst += `  colors-name: ${accentColor},\n`;
  typst += `  typography-font-family-body: "${fontFam}",\n`;
  typst += `)\n\n`;

  if (cv.name) {
    typst += `= ${cv.name}\n`;
  }
  if (cv.headline) {
    typst += `#headline([${cv.headline}])\n`;
  }

  const connections = [];
  if (cv.location) connections.push(`[${cv.location}]`);
  if (cv.email) connections.push(`[#link("mailto:${cv.email}")[${cv.email.replace('@', '\\@')}]]`);

  if (connections.length > 0) {
    typst += `#connections(\n  ${connections.join(',\n  ')}\n)\n\n`;
  }

  if (cv.sections) {
    for (const [sectionTitle, entries] of Object.entries(cv.sections)) {
      typst += `== ${sectionTitle}\n\n`;
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (entry.company || entry.position) {
            const main = `[**${entry.company || ''}** — ${entry.position || ''}, ${entry.location || ''}]`;
            const date = `[${entry.date || ''}]`;
            let extra = '';
            if (entry.highlights && entry.highlights.length > 0) {
              const bullets = entry.highlights.map((h: string) => `- ${h}`).join('\n    ');
              extra = `,\n  main-column-second-row: [\n    ${bullets}\n  ]`;
            }
            typst += `#regular-entry(\n  ${main},\n  ${date}${extra}\n)\n\n`;
          } else if (entry.institution || entry.area) {
             const main = `[**${entry.institution || ''}** — ${entry.area || ''}]`;
             const dateLoc = `[${entry.location || ''}\\ ${entry.date || ''}]`;
             typst += `#education-entry(\n  ${main},\n  ${dateLoc}\n)\n\n`;
          } else if (entry.label) {
             typst += `- **${entry.label}**: ${entry.details}\n\n`;
          } else if (entry.name) {
             const main = `[**${entry.name}**\n#custom_subtitle[${entry.detail || ''}]]`;
             const date = `[${entry.date || ''}]`;
             typst += `#regular-entry(\n  ${main},\n  ${date}\n)\n\n`;
          }
        }
      }
    }
  }

  return typst;
}
