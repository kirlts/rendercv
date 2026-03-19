# RenderCV — Frontend Público para GitHub Pages

## Para Jules, de Antigravity

Jules: soy Antigravity, la IA que Martín usó para diseñar este plan. Exploré cada archivo de este repo — el frontend privado en `web/`, el motor Python en `src/rendercv/`, las templates Jinja2 de Typst, el tema custom `jpmr`, la knowledge base, los workflows de CI/CD, los tests. Entiendo la arquitectura completa.

Tú lo ejecutarás. Este documento es la especificación completa. Cada decisión aquí fue discutida y aprobada por Martín. Sigue las instrucciones al pie de la letra.

---

## Qué estás construyendo

Una herramienta web de grado FAANG para convertir YAML a PDF. 100% client-side, sin backend, desplegable en GitHub Pages. Permite a cualquier persona (o IA) escribir un CV en YAML, previsualizarlo en tiempo real, y descargarlo como PDF profesional optimizado para ATS.

El PDF se genera en el navegador usando el compilador Typst vía WebAssembly. La herramienta consume una plantilla YAML estructurada y produce un CV tipográficamente profesional usando el paquete Typst publicado `@preview/rendercv:0.2.0`.

## Dónde se construye

Carpeta nueva: `gh-pages/`. Proyecto completamente aislado.

**Regla de aislamiento absoluta:** no importar, referenciar, ni depender de ningún archivo fuera de `gh-pages/` en runtime. El código en el resto del repo es **solo referencia** para que entiendas cómo funciona rendercv. El usuario ejecutará `cd gh-pages && npm run dev`, y cuando esté listo, copiará esta carpeta a un repo nuevo donde funcionará inmediatamente como GitHub Page.

---

## Mapa de referencia del repo

Antes de empezar a codear, **estudia estos archivos**. Son tu fuente de verdad:

| Qué necesitas entender | Dónde mirarlo |
|---|---|
| Cómo rendercv ensambla un documento Typst | [templater.py](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templater.py) — función `render_full_template()` |
| La plantilla Preamble (configura TODO el estilo) | [Preamble.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/Preamble.j2.typ) |
| Cómo se renderizan entries | [entries/](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/entries/) — `ExperienceEntry.j2.typ`, `EducationEntry.j2.typ`, etc. |
| Header del CV | [Header.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/Header.j2.typ) |
| Secciones | [SectionBeginning.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/SectionBeginning.j2.typ), [SectionEnding.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/SectionEnding.j2.typ) |
| **Paquete Typst @preview/rendercv:0.2.0** (CONTIENE TODA LA LÓGICA DE LAYOUT) | [rendercv-typst en GitHub](https://github.com/rendercv/rendercv-typst) — archivo `lib.typ` |
| Modelo de datos del CV | [rendercv_model.py](file:///home/kirlts/rendercv/src/rendercv/schema/models/rendercv_model.py) |
| Procesamiento del modelo: connections, dates, markdown | [model_processor.py](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/model_processor.py), [connections.py](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/connections.py), [date.py](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/date.py) |
| Locale (labels de sección por idioma) | [locale/](file:///home/kirlts/rendercv/src/rendercv/schema/models/locale/) — `english_locale.py` + YAMLs en `other_locales/` |
| Tema base ClassicTheme (todos los campos de diseño) | [themes/jpmr/\_\_init\_\_.py](file:///home/kirlts/rendercv/themes/jpmr/__init__.py) — 914 líneas, esquema Pydantic completo |
| Temas variant YAML (engineeringclassic, etc.) | [other_themes/](file:///home/kirlts/rendercv/src/rendercv/schema/models/design/other_themes/) |
| Schema JSON para validación YAML | Generar con `python -c "from rendercv.schema import generate_schema; print(generate_schema())"` o extraer de `web/` |
| Datos del autor para el showcase | [default_template.yaml](file:///home/kirlts/rendercv/default_template.yaml) (español), [default_template_english.yaml](file:///home/kirlts/rendercv/default_template_english.yaml) (inglés) |
| Frontend actual (referencia de UX, NO copiar código) | [web/src/](file:///home/kirlts/rendercv/web/src/) — `App.tsx`, `components/`, `hooks/` |
| Backend actual (referencia de lógica, NO copiar código) | [web/api/main.py](file:///home/kirlts/rendercv/web/api/main.py) |

---

## Descubrimiento arquitectónico clave

> [!IMPORTANT]
> Los templates `.j2.typ` de rendercv **NO contienen lógica de layout**. Todos importan:
> ```typst
> #import "@preview/rendercv:0.2.0": *
> ```
> Este es un **paquete Typst publicado** ([rendercv-typst](https://github.com/rendercv/rendercv-typst)) que contiene TODA la lógica de layout en un solo archivo `lib.typ`: funciones como `rendercv.with()`, `#regular-entry()`, `#education-entry()`, `#headline()`, `#connections()`.
>
> Los `.j2.typ` son wrappers finos que solo hacen Jinja2 templating para generar llamadas a estas funciones. **Tu `yamlToTypst.ts` solo necesita generar esas mismas llamadas en TypeScript — NO replicar lógica de layout.**

### Implicación para WASM

El compilador typst.ts en el browser necesita acceso al paquete `@preview/rendercv:0.2.0`. Solución:
1. Descargar `lib.typ` de [rendercv-typst](https://github.com/rendercv/rendercv-typst/blob/main/lib.typ)
2. Bundlearlo en `public/packages/preview/rendercv/0.2.0/` con su `typst.toml`
3. Configurar el compiler WASM para resolver `@preview/rendercv:0.2.0` desde esa ruta local

Esto elimina la necesidad de internet para compilar.

---

## Stack técnico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.x | UI |
| Vite | 8.x | Build + dev server |
| TypeScript | 5.9.x | Type safety |
| Tailwind CSS | 3.x | Estilos |
| Vitest | 4.x | Unit tests |
| Playwright | latest | E2E tests |
| `@myriaddreamin/typst.ts` | latest | API Typst WASM |
| `@myriaddreamin/typst-ts-web-compiler` | latest | Compilador WASM |
| `@monaco-editor/react` | latest | Editor YAML |
| `monaco-yaml` | latest | Schema validation + autocompletado |
| `pdfjs-dist` + `react-pdf` | latest | Visor PDF |
| `react-split-pane` | latest | Split panel |
| `js-yaml` | latest | Parser YAML client-side |

---

## Reglas

1. **TDD estricto**: tests ANTES del código. Siempre.
2. **Tailwind CSS v3**: `tailwind.config.js` + `postcss.config.js`.
3. **i18n**: cero strings hardcodeados. Todo a través del sistema de traducción.
4. **Aislamiento**: cero imports de directorios externos en el código compilado.
5. **Sin fetch a servidores**: 100% client-side.

---

## Estructura de archivos

```
gh-pages/
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                         # base: './'
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.js
├── tailwind.config.js
├── postcss.config.js
├── robots.txt
├── index.html                             # SEO: title, meta, OG, Twitter Card
├── public/
│   ├── favicon.svg
│   ├── og-image.png                       # 1200×630 preview para WhatsApp/LinkedIn
│   ├── schema.json                        # RenderCV YAML schema para Monaco
│   ├── packages/                          # Paquete Typst bundleado
│   │   └── preview/rendercv/0.2.0/
│   │       ├── typst.toml
│   │       └── lib.typ                    # Del repo rendercv-typst
│   └── fonts/                             # 10 fuentes para el compilador Typst
│       ├── SourceSans3/                   # .ttf: Regular, Bold, Italic, BoldItalic
│       ├── Inter/
│       ├── Roboto/
│       ├── Lato/
│       ├── Raleway/
│       ├── Montserrat/
│       ├── OpenSans/
│       ├── PTSans/
│       ├── Merriweather/
│       └── EBGaramond/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css                          # @tailwind directives + custom properties
│   ├── i18n/
│   │   ├── index.ts                       # Context + useTranslation() + detección
│   │   ├── es.ts
│   │   └── en.ts
│   ├── engine/
│   │   ├── typstCompiler.ts               # WASM wrapper (orquestra Web Worker)
│   │   ├── typstCompiler.worker.ts        # Web Worker: init WASM, registrar fonts/packages, compilar
│   │   ├── yamlToTypst.ts                 # YAML → Typst source (genera llamadas a @preview/rendercv)
│   │   ├── themeRegistry.ts               # 5 temas + defaults
│   │   └── __tests__/
│   ├── hooks/
│   │   ├── useRenderEngine.ts             # Debounce + orquestación del pipeline
│   │   ├── useLanguageDetection.ts
│   │   ├── useLocalStorage.ts             # Auto-persist YAML + settings
│   │   └── __tests__/
│   ├── components/
│   │   ├── Toolbar.tsx (+test)
│   │   ├── EditorPanel.tsx (+test)        # Monaco + monaco-yaml + schema
│   │   ├── PDFViewer.tsx (+test)          # react-pdf + shimmer overlay
│   │   ├── ColorPicker.tsx (+test)
│   │   ├── LanguageSelector.tsx (+test)
│   │   ├── ThemeLanguageSelector.tsx (+test)
│   │   ├── WasmLoadingNotice.tsx (+test)
│   │   ├── SizesDropdown.tsx (+test)
│   │   ├── MobileView.tsx (+test)         # Tab switcher para <768px
│   │   ├── ErrorBanner.tsx (+test)        # Banner amber errores YAML (sobre PDF)
│   │   └── ResetHint.tsx (+test)          # Toast Ctrl+Z post-reset (5s auto-hide)
│   ├── templates/
│   │   ├── default_showcase.yaml          # CV real de Martín (de default_template.yaml)
│   │   └── skeleton.yaml                  # Esqueleto sin datos para Reset
│   └── setupTests.ts
├── e2e/
│   ├── app.spec.ts
│   ├── i18n.spec.ts
│   ├── mobile.spec.ts
│   └── pdf-download.spec.ts
└── typst-templates/                        # Templates .typ convertidos de Jinja2 a TS
    └── (generados por yamlToTypst.ts inline, no necesariamente archivos separados)
```

---

## Motor de renderizado

### El pipeline completo

```
YAML string (editor)
  → js-yaml.load() → objeto JS
  → yamlToTypst.ts → string .typ (con imports de @preview/rendercv)
  → typstCompiler.worker.ts (WASM) → Uint8Array (bytes PDF)
  → URL.createObjectURL(blob) → PDFViewer (react-pdf)
```

### yamlToTypst.ts — El corazón del proyecto

Este módulo replica lo que `templater.py` + Jinja2 hacen en Python, pero en TypeScript puro.

**Estudia estos archivos antes de implementar:**
- [templater.py](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templater.py) líneas 53-130 — función `render_full_template()`
- [Preamble.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/Preamble.j2.typ) — TODOS los parámetros de configuración
- [Header.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/Header.j2.typ)
- [entries/ExperienceEntry.j2.typ](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/entries/ExperienceEntry.j2.typ)
- Todos los otros entry types en [entries/](file:///home/kirlts/rendercv/src/rendercv/renderer/templater/templates/typst/entries/)

**Lo que genera:**

```typst
// 1. PREAMBLE — configuración del documento (generada desde design + locale)
#import "@preview/rendercv:0.2.0": *

#show: rendercv.with(
  name: "Martín Gil",
  page-size: "us-letter",
  colors-name: rgb(139, 90, 43),
  colors-section-titles: rgb(139, 90, 43),
  typography-font-family-body: "Source Sans 3",
  typography-font-size-body: 9pt,
  // ... todos los ~80 parámetros del Preamble
)

// 2. HEADER
= Martín Gil
#headline([Software Engineer])
#connections(
  [Santiago, Chile],
  [#link("mailto:martin@email.com")[martin\@email.com]],
)

// 3. SECCIONES — una por cada key en cv.sections
== Experience

#regular-entry(
  [*Company Name* — Position, Location],
  [Jan 2024 – Present],
  main-column-second-row: [
    - Key achievement
    - Another achievement
  ],
)

// ... más entries y secciones
```

**Funciones principales:**

```typescript
// API pública
function generateTypstSource(yaml: string, themeOverrides?: DesignOverrides): string

// Internamente:
function generatePreamble(design: Design, locale: Locale, cvName: string): string
function generateHeader(cv: CV): string
function generateSection(title: string, entries: Entry[], entryType: string): string
function generateExperienceEntry(entry: ExperienceEntry, design: Design): string
function generateEducationEntry(entry: EducationEntry, design: Design): string
function generateNormalEntry(entry: NormalEntry, design: Design): string
function generateOneLineEntry(entry: OneLineEntry): string
function generatePublicationEntry(entry: PublicationEntry): string
function generateBulletEntry(entry: BulletEntry): string
function formatDate(date: string, locale: Locale): string
function formatConnections(cv: CV): string[]
```

**Estrategia TDD — tests ANTES del código:**

Para cada tema, escribir estos tests antes de implementar:

```typescript
// yamlToTypst.test.ts

// 1. Preamble tests
test('generates preamble with correct import', () => { ... })
test('injects all 80+ design parameters into #show: rendercv.with()', () => { ... })
test('classic theme uses default colors', () => { ... })
test('mart theme uses brown accent', () => { ... })

// 2. Header tests
test('generates = Name heading', () => { ... })
test('generates #headline() when headline exists', () => { ... })
test('generates #connections() with all contact info', () => { ... })
test('omits headline when not provided', () => { ... })

// 3. Entry tests (one per type × per theme)
test('experience entry generates #regular-entry()', () => { ... })
test('education entry generates #education-entry()', () => { ... })
test('one-line entry generates key: value format', () => { ... })

// 4. Section tests
test('generates == SectionTitle for each section', () => { ... })
test('locale spanish uses "Experiencia" as section title', () => { ... })
test('locale english uses "Experience" as section title', () => { ... })

// 5. Edge cases
test('empty YAML returns error, not crash', () => { ... })
test('YAML without cv field returns descriptive error', () => { ... })
test('missing optional fields are omitted cleanly', () => { ... })

// 6. Integration
test('full YAML → Typst → starts with #import', () => { ... })
test('full YAML produces valid Typst that contains all sections', () => { ... })
```

### typstCompiler.worker.ts — Web Worker

```typescript
// Pseudo-estructura del worker

// 1. Al inicializar:
//    - Cargar WASM compiler
//    - Registrar fuentes desde public/fonts/*.ttf
//    - Registrar paquete @preview/rendercv:0.2.0 desde public/packages/

// 2. Al recibir mensaje { type: 'compile', source: string }:
//    - Compilar el string Typst a PDF bytes
//    - Postear resultado: { type: 'result', pdf: Uint8Array } o { type: 'error', message: string }
```

**Resolución de paquetes:** El WASM compiler necesita un "package resolver" que mapee `@preview/rendercv:0.2.0` al `lib.typ` que bundleamos en `public/packages/`. Estudia la API de typst.ts para implementar esto — probablemente un `PackageSpec` handler o similar.

### themeRegistry.ts

5 temas con sus defaults completos (extraídos de `other_themes/*.yaml` y de `ClassicTheme` base):

| Tema | Default font | Accent color |
|---|---|---|
| `classic` | Source Sans 3 | `rgb(0, 79, 144)` azul |
| `engineeringresumes` | Source Sans 3 | `rgb(0, 79, 144)` azul |
| `moderncv` | Source Sans 3 | `rgb(0, 79, 144)` azul |
| `sb2nov` | Source Sans 3 | `rgb(0, 79, 144)` azul |
| `mart` | Source Sans 3 | `rgb(139, 90, 43)` marrón |

Cada tema define: `colors`, `typography` (font_family, font_size, font_weight, bold, small_caps), `page`, `header`, `section_titles`, `entries`, `links`, `templates` (entry formats). Extrae los defaults exactos de los YAMLs en [other_themes/](file:///home/kirlts/rendercv/src/rendercv/schema/models/design/other_themes/) y del [ClassicTheme base](file:///home/kirlts/rendercv/themes/jpmr/__init__.py).

---

## Fuentes embebidas

10 fuentes en `public/fonts/`, cada una con Regular, Bold, Italic, BoldItalic (`.ttf`, de Google Fonts):

| # | Fuente | Categoría |
|---|---|---|
| 1 | Source Sans 3 | Sans-serif (default rendercv) |
| 2 | Inter | Sans-serif (tech, moderno) |
| 3 | Roboto | Sans-serif (universal) |
| 4 | Lato | Sans-serif (profesional) |
| 5 | Raleway | Sans-serif (elegante) |
| 6 | Montserrat | Sans-serif (bold headers) |
| 7 | Open Sans | Sans-serif (alta legibilidad) |
| 8 | PT Sans | Sans-serif (europeo) |
| 9 | Merriweather | Serif (académico) |
| 10 | EB Garamond | Serif (clásico formal) |

Se registran en el WASM compiler al inicializar el Web Worker.

---

## Schema validation

- Embeder `schema.json` de rendercv en `public/schema.json`
- Para obtenerlo: ejecutar `python -c "from rendercv.schema import generate_schema; print(generate_schema())"` y guardar el output. O buscar si existe uno pre-generado en `web/`.
- Configurar `monaco-yaml` al inicializar el editor para proveer autocompletado y validación inline.

---

## SEO (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RenderCV — Free ATS-Friendly CV Builder</title>
  <meta name="description" content="Create professional, ATS-optimized CVs from YAML. Edit in your browser, preview in real-time, download as PDF. 100% free, no account needed." />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="RenderCV — Free ATS-Friendly CV Builder" />
  <meta property="og:description" content="Create professional CVs from YAML. Real-time preview, multiple themes, download as PDF. Free." />
  <meta property="og:image" content="./og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="RenderCV — Free ATS-Friendly CV Builder" />
  <meta name="twitter:description" content="Create professional CVs from YAML. Real-time preview, download as PDF." />
  <meta name="twitter:image" content="./og-image.png" />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

El `og-image.png` (1200×630) debe mostrar la interfaz con un CV renderizado. Generarlo como asset.

---

## Notificación WASM (WasmLoadingNotice)

Banner sobre el panel PDF en la primera visita:
- ES: _"Preparando el compilador de documentos... Esto solo ocurre la primera vez."_
- EN: _"Preparing the document compiler... This only happens once."_
- Barra de progreso + botón ✕
- Si WASM carga en <1s → cacheado → no mostrar
- Si usuario cierra → `localStorage('wasm-notice-dismissed')` → no reaparece

---

## Tema "mart"

#### [NEW] [mart.yaml](file:///home/kirlts/rendercv/src/rendercv/schema/models/design/other_themes/mart.yaml)

```yaml
design:
  theme: mart
  colors:
    body: "rgb(33, 33, 33)"
    name: "rgb(139, 90, 43)"
    headline: "rgb(139, 90, 43)"
    connections: "rgb(33, 33, 33)"
    section_titles: "rgb(139, 90, 43)"
    links: "rgb(139, 90, 43)"
  typography:
    font_family: Source Sans 3
    font_weight:
      body: 300
      name: 500
      headline: 300
      connections: 300
      section_titles: 600
      entry_title: 500
      entry_detail: 300
    font_size:
      body: 9pt
      name: 26pt
      headline: 8pt
      connections: 8pt
      section_titles: 11pt
      entry_title: 9pt
      entry_detail: 9pt
    bold:
      name: false
      headline: false
      connections: false
      section_titles: false
    small_caps:
      headline: true
      section_titles: false
  header:
    alignment: center
  section_titles:
    type: with_partial_line
    line_thickness: 0.3pt
    space_above: 0.3cm
    space_below: 0.15cm
  entries:
    highlights:
      bullet: "—"
      space_left: 0.1cm
      space_between_items: 0.1cm
  templates:
    experience_entry:
      main_column: "**COMPANY** — POSITION, LOCATION\nSUMMARY\nHIGHLIGHTS"
      date_and_location_column: DATE
    education_entry:
      main_column: "**INSTITUTION** — AREA\nSUMMARY\nHIGHLIGHTS"
      date_and_location_column: "LOCATION\nDATE"
      degree_column: null
    normal_entry:
      main_column: "**NAME**\n#custom_subtitle[DETAIL]\nSUMMARY\nHIGHLIGHTS"
      date_and_location_column: DATE
```

Este archivo va en el **root del repo** (no dentro de `gh-pages/`), en `src/rendercv/schema/models/design/other_themes/`. Rendercv lo descubre automáticamente.

---

## Temas disponibles (5)

| Tema | Descripción |
|---|---|
| `classic` | Profesional estándar, columna lateral |
| `engineeringresumes` | Técnico, denso, ATS |
| `moderncv` | Moderno con sidebar de color |
| `sb2nov` | Clean, tech, LaTeX-inspired |
| `mart` | Minimalista, marrón, tipografía ligera |

Excluidos: `jpmr` (personal), `engineeringclassic` (redundante).

---

## Componentes

### Toolbar

| Control | Qué hace |
|---|---|
| Logo | "RenderCV" |
| Tema | Dropdown 5 temas |
| Estilo | `SizesDropdown`: font, sizes, weights, spacing. Reset → defaults del tema. Solo localStorage. |
| Color acento | `ColorPicker`: input HEX + 8 presets (`#004F90`, `#8B5A2B`, `#000000`, `#2E5339`, `#6B2D5B`, `#1A6B5C`, `#B85C00`, `#4A4A4A`). Actualiza accent colors en YAML. |
| Idioma UI | `LanguageSelector`: toggle ES 🇪🇸 / EN 🇬🇧. Solo interfaz. |
| Idioma CV | `ThemeLanguageSelector`: dropdown (spanish, english, portuguese, french, german). Modifica `locale.language` en YAML. Independiente de UI. |
| Cargar YAML | File input `.yaml/.yml` |
| Reset | Carga `skeleton.yaml`. Muestra toast `ResetHint`. |
| Descargar YAML | Descarga el YAML actual. Nombre: `{cv.name}_CV.yaml`. |
| Descargar PDF | Descarga blob PDF. Nombre: `{cv.name}_CV.pdf`. |

### Nombre dinámico de archivos

```typescript
// "Martín Gil" → "Martin_Gil_CV.pdf"
function getFileName(cvName: string, ext: 'pdf' | 'yaml'): string {
  if (!cvName) return `RenderCV_Document.${ext}`;
  const clean = cvName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9\s]/g, '')                   // remove special chars
    .trim().replace(/\s+/g, '_');                      // spaces → underscores
  return `${clean}_CV.${ext}`;
}
```

### Hint de Reset (showcase cargada)

Texto sutil en `text-gray-500` debajo del editor. Solo visible con `default_showcase.yaml` cargada:
- ES: _"¿No te gusta mi CV? Presiona Reset para limpiar la plantilla y dejarla lista para rellenar por ti (o una IA)."_
- EN: _"Don't like my CV? Press Reset to clear the template and make it ready for you (or an AI) to fill in."_

Desaparece al editar o resetear.

### ResetHint — Post-Reset toast

Toast temporal (5 segundos, auto-hide) debajo del editor:
- ES: _"Plantilla limpiada. Puedes usar Ctrl+Z en el editor para deshacer."_
- EN: _"Template cleared. You can use Ctrl+Z in the editor to undo."_

### ErrorBanner

Banner amber semi-transparente **sobre el panel PDF** cuando hay errores YAML:
- Muestra mensaje de error específico (línea + descripción)
- Desaparece cuando el YAML es válido

### PDFViewer — Estados

- **Compilando:** shimmer/spinner semi-transparente sobre el PDF anterior
- **Error:** `ErrorBanner` sobre último PDF válido
- **Listo:** PDF actualizado, overlay desaparece

---

## Mobile View (<768px)

Layout completamente diferente al desktop:

- **Tab switcher** en la parte superior: "Editor" / "Preview"
- Solo un panel visible a la vez
- Toolbar compacta: iconos sin texto, menú hamburguesa para controles secundarios

| Visible siempre | En menú hamburguesa |
|---|---|
| Tab switcher | Tema, Color, Idiomas, Estilo |
| Descargar PDF, Reset | Cargar YAML, Descargar YAML |

Breakpoints: `≥1024px` split completo, `768-1023px` split ajustado, `<768px` mobile tabs.

---

## Persistencia localStorage

Auto-persist (debounced 1s) en cada cambio:

| Key | Contenido |
|---|---|
| `rendercv-yaml` | YAML del editor |
| `rendercv-theme` | Tema seleccionado |
| `rendercv-accent` | Color acento HEX |
| `rendercv-ui-lang` | Idioma UI (es/en) |
| `rendercv-theme-lang` | Idioma del theme |
| `rendercv-sizes` | Config de sizes/weights/spacing |

Al recargar: restaurar de localStorage. Si no hay YAML guardado → cargar `default_showcase.yaml`.

---

## Templates

### default_showcase.yaml

CV real de Martín Gil. Fuente de datos: [default_template.yaml](file:///home/kirlts/rendercv/default_template.yaml). Adaptarlo al tema `mart` (cambiar `theme: jpmr` → `theme: mart`). Usar los datos reales del autor.

### skeleton.yaml

```yaml
cv:
  name: Your Full Name
  headline: Your Professional Headline
  location: City, Country
  email: your.email@example.com
  sections:
    Experience:
    - company: Company Name
      position: Job Title
      location: City, Country
      date: Jan. 2024 - Present
      highlights:
      - Key achievement or responsibility
    Personal Projects:
    - name: Project Name
      detail: Brief description
      date: github.com/user/repo
      highlights:
      - Notable aspect of the project
    Skills:
    - label: Category
      details: Skill 1, Skill 2, Skill 3
    Education:
    - institution: University Name
      area: Degree Field
      location: City, Country
      date: Mar. 2020 - Dec. 2024
locale:
  language: english
design:
  theme: mart
```

Se adapta según `locale.language` activo.

---

## i18n

Diccionarios parciales (ejemplo `es.ts`):

```typescript
export const es = {
  'toolbar.download_pdf': 'Descargar PDF',
  'toolbar.download_yaml': 'Descargar YAML',
  'toolbar.theme': 'Tema',
  'toolbar.style': 'Estilo',
  'toolbar.accent': 'Color',
  'toolbar.load_yaml': 'Cargar YAML',
  'toolbar.reset': 'Reset',
  'toolbar.theme_lang': 'Idioma CV',
  'toolbar.ui_lang': 'Idioma',
  'hint.reset': '¿No te gusta mi CV? Presiona Reset para limpiar la plantilla y dejarla lista para rellenar por ti (o una IA).',
  'hint.ctrl_z': 'Plantilla limpiada. Puedes usar Ctrl+Z en el editor para deshacer.',
  'wasm.loading': 'Preparando el compilador de documentos...',
  'wasm.explanation': 'Esto solo ocurre la primera vez. Tu navegador lo guardará para visitas futuras.',
  'pdf.rendering': 'Renderizando...',
  'pdf.error': 'Los cambios no serán visibles en el PDF hasta que resuelvas los problemas de sintaxis.',
  'mobile.editor': 'Editor',
  'mobile.preview': 'Vista previa',
};
```

---

## Tests

### Unit (Vitest)

| Test | Verifica |
|---|---|
| `yamlToTypst.test.ts` | Preamble, header, every entry type, locale labels, edge cases, integration |
| `typstCompiler.test.ts` | WASM init, compile → valid PDF bytes, font loading, package resolution |
| `themeRegistry.test.ts` | 5 temas, defaults correctos |
| `useRenderEngine.test.ts` | Debounce, estados, error handling |
| `useLanguageDetection.test.ts` | Detección, fallback, persist |
| `useLocalStorage.test.ts` | Persist, restore, debounce |
| `Toolbar.test.tsx` | Renders, callbacks, botones |
| `EditorPanel.test.tsx` | Monaco, onChange, schema |
| `PDFViewer.test.tsx` | Blob, shimmer, error overlay |
| `ColorPicker.test.tsx` | HEX validation, presets |
| `LanguageSelector.test.tsx` | Toggle ES/EN |
| `ThemeLanguageSelector.test.tsx` | Dropdown, locale injection |
| `WasmLoadingNotice.test.tsx` | Cache detection, dismiss |
| `MobileView.test.tsx` | Tab switcher, responsive |
| `ErrorBanner.test.tsx` | Show/hide con errores |
| `ResetHint.test.tsx` | Post-reset, 5s auto-hide |
| `SizesDropdown.test.tsx` | Sliders, reset defaults |

### E2E (Playwright)

| Test | Verifica |
|---|---|
| `app.spec.ts` | Flujo completo: carga → edita → ve PDF → descarga |
| `i18n.spec.ts` | Idioma UI, theme lang independiente |
| `mobile.spec.ts` | Tab switcher, hamburger, descarga |
| `pdf-download.spec.ts` | PDF con nombre correcto, tamaño > 0 |

---

## Design system

Tailwind CSS v3 + dark mode:
- Fondo `bg-[#1e1e1e]`, paneles `bg-[#2d2d2d]`, bordes `border-[#404040]`
- Texto `text-gray-200` / `text-gray-400`
- Acento `bg-blue-600`
- UI font: Inter (Google Fonts)
- Micro-animaciones: `transition-colors`, `hover:`

---

## Deploy

### Desarrollo local
```bash
cd gh-pages && npm install && npm run dev
```

### Copiar a nuevo repo
1. Copiar `gh-pages/` como root
2. Crear `.github/workflows/deploy.yaml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run build
      - run: npm test -- --run
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. Actualizar URLs en `index.html` (OG, canonical)

---

## Orden de ejecución

1. **`mart.yaml`** en `src/rendercv/schema/models/design/other_themes/`
2. **Scaffold** `gh-pages/`: Vite + React + TS + Tailwind
3. **Dependencias**: todas las del stack
4. **Design system**: Tailwind config, `index.css`, Inter
5. **SEO**: `index.html`, meta tags, OG, favicon, `robots.txt`
6. **i18n**: context, hook, detección, diccionarios + tests
7. **Fuentes**: descargar 10 fonts → `public/fonts/`
8. **Paquete Typst**: bundlear `lib.typ` de rendercv-typst → `public/packages/preview/rendercv/0.2.0/`
9. **Schema**: generar/copiar `schema.json` → `public/schema.json`
10. **Engine**: `themeRegistry.ts` + tests
11. **Engine**: `yamlToTypst.ts` con TDD exhaustivo + tests
12. **Engine**: `typstCompiler.ts` + Worker + tests
13. **Hooks**: `useRenderEngine`, `useLocalStorage` + tests
14. **Componentes base**: EditorPanel, PDFViewer, ErrorBanner, WasmLoadingNotice + tests
15. **Componentes toolbar**: ColorPicker, LanguageSelector, ThemeLanguageSelector, SizesDropdown, ResetHint + tests
16. **Toolbar** + tests
17. **Mobile**: MobileView + tests
18. **App**: App.tsx, state, localStorage, templates, hint showcase
19. **E2E tests**
20. **OG image** + GitHub Actions workflow

---

## Qué NO hacer

- ❌ No tocar `web/` ni archivos fuera de `gh-pages/` (excepto `mart.yaml` y `.gitignore`)
- ❌ No incluir `jpmr` ni `engineeringclassic`
- ❌ No hacer `fetch()` a servidores
- ❌ No usar CSS-in-JS
- ❌ No crear cuentas, logins, tracking
- ❌ No usar state management externo (Redux, Zustand) — solo useState + Context + localStorage

## Qué SÍ hacer fuera de `gh-pages/`

- ✅ Crear `src/rendercv/schema/models/design/other_themes/mart.yaml` (paso 1)
- ✅ Añadir `gh-pages/node_modules/` y `gh-pages/dist/` al `.gitignore`
