# Registro de Cambios: RenderCV Antigravity Fork

*Este documento registra exclusivamente las modificaciones estructurales y algorítmicas implementadas en el Fork local (Antigravity Sastrería CV), **independiente** del desarrollo central de la librería original RenderCV.*

---

---

## [1.8.1] - 2026-03-18

### Added

- **Validación Obligatoria Autosuficiente** (`scripts/validate_yaml.py`, `rules/05-mandatory-validation-protocol.md`, `tailor-cv.md`): Script Python que llama directamente a `build_rendercv_dictionary_and_model()` sin requerir servidor. Nueva regla que obliga al agente a validar cada YAML contra el parser de RenderCV antes de entrega. Gate de calidad como Paso 4.5 en el workflow `tailor-cv.md`. Cheatsheet de caracteres YAML peligrosos (`:`, `&`, `#`, `!`) con regla de citado preventivo.
- **HEU-017** (`MEMORY.md`): Heurística sobre `:` en strings YAML parseado silenciosamente como key-value dict, causando errores de tipo downstream en Pydantic.

### Fixed

- **YAML Highlight con Colon** (`ofertas/senior_genai_engineer_tcs_15-13_18-Mar-26_en.yaml`): `- Applied in QM Validator: JSON-LD...` parseado como dict `{Applied in QM Validator: JSON-LD...}` en vez de string. Corregido con comillas dobles.

---

## [1.8.0] - 2026-03-18

### Added

- **Soporte Bilingüe CV (ES/EN)** (`default_template_english.yaml`, `04-template-sync-protocol.md`, `02-cv-sartorial-crafting.md`, `03-gap-fill-protocol.md`, `SKILL.md`, `tailor-cv.md`, `main.py`, `Toolbar.tsx`, `App.tsx`): Arquitectura completa para generar CVs en inglés. KB enriquecida con `Condensed Bullets EN` (9 entries, action verbs en pasado). Nuevo template EN con `locale: english`. Protocolo de sincronización ES↔EN por `mtime`. Art. 2 bis: regla verbal bilingüe. Art. 4: modo creativo para highlights generados por IA. Backend `?lang=en|es` en GET/PUT `/api/default-template`. Frontend: dropdown "Plantilla base" (🇪🇸/🇬🇧). Botón "Actualizar plantilla (Español/Inglés)". Detección automática de idioma en `tailor-cv.md` (Paso 1.5). Sufijo `_en` en ofertas EN.
- **Pipeline KB Bilingüe** (`extract-knowledge/SKILL.md`, `02-cv-sartorial-crafting.md`): Al crear/regenerar entries, el agente DEBE generar ambas versiones de Condensed Bullets simultáneamente. Template de entry actualizado con campos `Condensed Bullets` + `Condensed Bullets EN`.

### Changed

- **OneLineEntry Styling** (`OneLineEntry.j2.typ`): Labels usan `entry_title` font size/weight (controlables vía slider Subsecciones), details usan `entry_detail` (slider Sub. detalle). Columna labels fijada a 5cm con `par(justify: false)` para alineación derecha limpia sin stretch.
- **Section Titles Default** (`jpmr/__init__.py`, `themes/.overrides/jpmr.json`): Font size cambiado de `1.3em` a `12pt` para consistencia con sliders en `pt`.
- **Orden de Experiencias** (`default_template.yaml`, `default_template_english.yaml`): UAH primero, luego UNAB. Position UNAB: "Investigador y Desarrollador de IA" / "AI Researcher and Developer".
- **Skills Labels Simplificadas** (`default_template.yaml`, `default_template_english.yaml`): Eliminado prefijo "Habilidad N, ej:", solo nombre de categoría. "Idiomas" → "Idiomas Hablados" / "Spoken Languages".
- **Nombre EN** (`default_template_english.yaml`): Sin acentos (`Martin Gil Oyarzun`) para compatibilidad ATS anglófona.
- **Cargo Sin Nivel de Experiencia** (`tailor-cv.md`, `SKILL.md`, `main.py`): La IA no incluye calificadores de nivel (Senior, Junior, Lead, etc.) al extraer cargos de JDs. Regex safety net en endpoint `save-cv`.
- **Validación Obligatoria** (`tailor-cv.md` Paso 4.5): Gate de calidad que valida YAML contra `/api/render` antes de entrega.

---

## [1.7.0] - 2026-03-18

### Added

- **Spacing Sliders Per-Field** (`SizesDropdown.tsx`, `App.tsx`, `useRenderEngine.ts`, `main.py`): Tercer slider por campo para control de espaciado en centímetros (rango 0.05–2.0, step 0.05). `SPACING_YAML_MAP` inyecta valores en los sub-objects correctos del bloque `design` (header, section_titles, sections, typography). Backend extrae/guarda spacing en overrides JSON.
- **Editable Values con Clamping** (`SizesDropdown.tsx`): Todos los valores numéricos (tamaño, peso, espaciado) son clickeables y editables por teclado. Valores fuera de rango se ajustan automáticamente al límite más cercano. Pesos se redondean al múltiplo de 50 más cercano.
- **PDF Responsive** (`PDFViewer.tsx`, `index.css`): El canvas PDF se rasteriza a ancho fijo de 800px y CSS `width: 100% !important` (clase `.pdf-page-scaled`) escala el resultado para llenar el espacio horizontal del panel. Zero re-rasterización, zero flicker al redimensionar.
- **Hyperlinks en Nueva Pestaña** (`PDFViewer.tsx`): `externalLinkTarget="_blank"` en el componente `Document` de react-pdf.
- **API `?fresh=1`** (`main.py`): `GET /api/theme-defaults/{id}?fresh=1` salta overrides guardados y devuelve defaults originales del theme.
- **HEU-014, HEU-015, HEU-016** (`MEMORY.md`): Nuevas heurísticas para CSS scaling de PDF, accent-color variable en browsers, y YAML flow sequences con guillemets.

### Changed

- **Custom Slider CSS** (`index.css`): Todos los sliders usan `appearance: none` con track (`#404040`) y thumb custom por clase (`slider-size`, `slider-weight`, `slider-spacing`) vía `currentColor`. Reemplaza `accent-color` nativo que producía tracks blancos en Chrome para el color purple.
- **Dropdown Responsive** (`SizesDropdown.tsx`): `max-w-[90vw]` y `overflow-x-hidden` para evitar desbordamiento al hacer zoom.
- **Reset → Last Saved** (`App.tsx`): "Reiniciar" restaura últimos defaults guardados desde `themeDefaults` en memoria (actualizado en cada "Guardar"), no desde API fresh.
- **YAML Placeholders** (`default_template.yaml`): Reemplazados `[...]` por guillemets `«...»` para evitar parsing YAML como flow sequences.
- **`color-scheme: dark`** (`index.css`): Aplicado globalmente para que controles nativos de formulario usen colores dark mode.

### Fixed

- **Typst OneLineEntry Overlap** (`OneLineEntry.j2.typ`): Entries wrapeados en `block(above: 0.15cm, below: 0.15cm)` para bypass de `par(spacing: 0cm)` del paquete rendercv que zeroeaba paragraph spacing.
- **Weight Slider White Background**: Custom CSS con track/thumb elimina dependencia de `accent-color` de Chrome que producía track blanco para colores purple.

---

## [1.6.0] - 2026-03-18

### Added

- **Condensed Bullets Architecture** (`experience.md`, `extracurricular.md`): Cada entry de la KB ahora contiene exactamente 3 `Condensed Bullets` pre-comprimidos y CV-ready, usados como fuente primaria por el agente. Los `Details` se conservan como prosa completa de referencia. El agente puede regenerar Condensed Bullets si los Details cambian.
- **Subtitle Field** (`extracurricular.md`): Nuevo campo `- **Subtitle**:` en los 6 proyectos extracurriculares, mapeado al campo `detail` del YAML (renderizado como subtítulo en el tema `jpmr`).
- **Art. 6: Condensación Obligatoria** (`02-cv-sartorial-crafting.md`): Prohibición de copy-paste de `Details`. Exactamente 3 Condensed Bullets por entry, regeneración permitida, una sola capa de nominalización, nombrar herramientas sin describir funciones.
- **Art. 7: Acrónimos de Industria** (`02-cv-sartorial-crafting.md`): Lista de ~30 acrónimos estándar (AWS, GCP, CI/CD, LLM, etc.) que nunca deben expandirse en el CV.
- **Regla de Subtítulo en Proyectos** (`SKILL.md`): Campo `Subtitle` de la KB mapea al `detail` del YAML.
- **Regla de Orden de Bullets** (`SKILL.md`): Highlights ordenados por impacto arquitectónico descendente.
- **Regla de Keywords de Industria** (`SKILL.md`): Mapeo de conceptos KB a terminología estándar de industria (ej. "Structured Output", "embeddings").
- **Excepción de Recomendación** (`03-gap-fill-protocol.md`): El agente puede recomendar mejoras al contenido FIJADO en su informe de entrega, siempre en función de la oferta laboral específica.

### Changed

- **Corrección Factual** (`experience.md`): "validación determinista" → "validación parcialmente determinista" en UNAB.
- **Art. 3 Sartorial Crafting**: Eliminada instrucción de copy-paste, reemplazada por referencia a Condensed Bullets como fuente primaria. Fórmula actualizada: `[Sustantivo Verbal] + [Qué/Cifra] + [Stack] + [Resultado]`.
- **SKILL.md Aislamiento Granular**: Referencia explícita a Condensed Bullets como fuente primaria, con Details como fallback.
- **Default Template** (`default_template.yaml`): Summary de tesis UNAB enriquecido con keywords (JSON-LD, pgvector, RAG, Vue.js) y publicaciones (IFE 2026, EDUNINE 2026).

---

## [1.5.1] - 2026-03-18

### Added

- **Save in CVs Button** (`POST /api/save-cv`): Botón "Save in CVs" en Toolbar que renderiza y guarda el PDF directamente en `CVs/Martin Gil CV - [Cargo] - [Idioma].pdf`. Cargo extraído de `output_folder` (split en ` - `, solo primera parte, sin empresa). Idioma mapeado desde `locale.language`. Estados visuales loading/saved/error con iconos `Loader2`/`Check`/`FolderDown`.
- **Anti-Solapamiento Experiencia ↔ Proyectos** (`02-cv-sartorial-crafting.md` Art. 5): Regla que impide incluir un proyecto personal en la sección `Proyectos Personales` si ya está cubierto sustancialmente por una entry de `Experiencia`. Auditoría cruzada obligatoria como paso 4 en `craft-yaml-cv/SKILL.md`.

### Changed

- **Knowledge Base Consolidation**: Bullets únicos del Validador QM absorbidos de `extracurricular.md` → `experience.md` (UNAB): contexto tesis de grado, adopción institucional, sistema de alerta. Sección duplicada eliminada de extracurricular.
- **.gitignore**: Deduplicado (template Python estaba repetido 2×), reorganizado por secciones, agregados `web/test-results/` y `cv.yaml`.

---

## [1.5.0] - 2026-03-18

### Added

- **Per-Field Font Size/Weight Controls (Dropdown "Tamaños")**: 7 campos configurables (Cuerpo, Nombre, Titular, Contacto, Secciones, Subsecciones, Sub. detalle) con slider tamaño + peso. Valores editables por teclado. Botones "Reiniciar" y "Guardar" con feedback visual (✓ verde 1.5s).
- **Entry Title/Detail System**: Nuevos campos `entry_title`/`entry_detail` en `FontSize`/`FontWeight` de jpmr. `custom_subtitle()` parametrizado. NormalEntry template con placeholder `DETAIL`.
- **Save Ofertas** (`PUT /api/ofertas/{filename}`): Botón 💾 junto a Ofertas.
- **Save Theme Defaults** (`PUT /api/theme-defaults/{theme_id}`): Persistencia via JSON sidecar.

### Changed

- **Body Weight Bug Fix**: `#show strong` ahora usa entry_title weight (no body+300).
- **Spacing Habilidades +50%**: `0.3em` → `0.45em`.

### Fixed

- **Import `Request` faltante en `main.py`**: Causaba 422 en PUT endpoints.

---

## [1.4.0] - 2026-03-17

### Added

- **Protocolo de Gap-Fill** (`rules/03-gap-fill-protocol.md`): Nueva regla que define una taxonomía de 4 estados (VACÍO, FIJADO, PARCIAL, INSTRUIDO) para que la IA rellene inteligentemente templates parcialmente pre-rellenados por el usuario desde el frontend, sin tocar contenido fijado.
- **Regla de Hipervínculo en Proyectos** (`SKILL.md`, `02-cv-sartorial-crafting.md`): Los títulos de proyectos con URL documentada en la KB deben renderizarse como hipervínculos markdown clickeables.
- **HEU-009**: Documentada la necesidad de reglas cuantitativas deterministas (exactamente N) vs rangos ambiguos (3-5) para prevenir variabilidad entre generaciones de CV.

### Changed

- **Arquitectura Template-Driven** (`SKILL.md`, `tailor-cv.md`, `default_template.yaml`): Eliminadas TODAS las cantidades y nombres de sección hardcodeados. El template es la única fuente de verdad para secciones, entries y highlights.
- **Gap-Fill Protocol Art. 6** (`03-gap-fill-protocol.md`): Nuevo artículo de Soberanía Estructural del Template.
- **Gap-Fill Protocol Art. 5** (`03-gap-fill-protocol.md`): Restricción de 1 página suavizada con escape valve (advertencia al usuario si el contenido fijado excede 1 página).
- **Regla Cardinal** (`SKILL.md`): Actualizada para referenciar el Gap-Fill Protocol y clasificar campos antes de rellenar.
- **Template Header** (`default_template.yaml`): Reescrito para reflejar el paradigma de lienzo gap-fillable con instrucciones de clasificación de estados.

---

## [1.4.0] - 2026-03-17

### Added

- **Font Weight Selector**: Slider de peso tipográfico (100-900, step 50, default 400) en la Toolbar, persistido en `localStorage`. La inyección YAML escribe `design.typography.font_weight` y el Preamble.j2.typ aplica `#set text(weight: N)` condicionalmente (omite si weight=400 para no alterar spacing por defecto).
- **Load Default Template**: Botón "Default" en la Toolbar que carga `default_template.yaml` en el editor vía `GET /api/default-template`.
- **Update Template Logic**: Cuando el usuario carga la plantilla por defecto y la modifica, el botón "Download PDF" se transforma en "Update Template" (naranja). Al hacer click, `PUT /api/default-template` sobreescribe el archivo en disco y el botón revierte a "Download PDF".
- **API `/api/default-template`**: Endpoints GET (lectura) y PUT (escritura) para `default_template.yaml`.
- **API `/api/fonts` — Bundled Fonts**: El endpoint ahora incluye fuentes empaquetadas de RenderCV (Source Sans 3, Lato, Raleway, etc.) además de las del sistema.
- **HEU-009**: Heurística sobre el impacto del peso tipográfico explícito en Typst (weight 400 = default, condicional para no afectar spacing).

### Changed

- **Source Sans 3 Restaurado**: Todas las FontFamily del tema `jpmr` revertidas de Inter a Source Sans 3 como fuente por defecto, confirmada por análisis tipográfico contra la desired template.
- **Replicación Visual 1:1 del Desired Template**: Ajuste exhaustivo de spacing uniforme: `line_spacing: 0.6em`, `space_below_name/headline: 0.15cm`, `space_below_connections: 0.3cm`, `section space_above: 0.35cm`, `section space_below: 0.12cm`, `entry spacing: 0.5em`. Líneas de sección cambiadas de `rgb("333333")` a negro puro. Texto justificado sin hyphenation restaurado.
- **Toolbar 25% Más Compacta**: Todos los elementos reducidos (h-14→h-11, text-sm→text-xs, px-3→px-2, icons w-4→w-3). Layout con `flex-wrap` para responsividad horizontal.
- **Header.j2.typ**: Primer nombre con weight "light" y color gris `rgb("999999")` para coincidir con Source Sans 3.

### Fixed

- **Weight Slider No Actualizaba PDF**: Faltaba `debouncedWeight` en la dependency array del `useEffect` de renderizado en `useRenderEngine.ts`.
- **Font Injection Path**: Corregido de `design.font_family` a `design.typography.font_family` en `useRenderEngine.ts`.

---

## [1.3.0] - 2026-03-17

### Changed

- **Knowledge Base — Corrección Factual**: `experience.md` verificado contra `raw dumps/linkedin-text.txt`. Cargo traducido a español ("Desarrollador Principal"), término "autenticación M2M" eliminado como venta de humo, contexto "Teatro Municipal de Santiago" y "FONDECYT" restaurados, bullet de publicaciones corregido ("2 papers enviados a conferencia" en vez de "documentos técnicos").
- **Regla Anti-Inyección de JD** (`02-cv-sartorial-crafting.md` Art. 4): Nueva restricción prohibiendo insertar lenguaje del Job Description en bullets de experiencia.
- **Regla Anti-Em-Dash** (`02-cv-sartorial-crafting.md` Art. 2.6): Prohibición explícita del carácter `—` y doble guion como marcador estilístico de IA.
- **Buzzwords en Español**: Lista negra expandida con traducciones al español y generalidades vacías como "Patrones de Diseño" o "Pensamiento Estratégico".
- **Headline Inmutable** (`craft-yaml-cv/SKILL.md`): El agente no modifica el headline salvo instrucción explícita.
- **Traducción Flexible de Cargos** (`craft-yaml-cv/SKILL.md`): Traduce `position` solo cuando existe equivalente natural, preservando términos de industria (Full-Stack, DevOps, etc.).
- **Calificador de Prácticas** (`craft-yaml-cv/SKILL.md`): Prácticas profesionales deben preservar su calificador y tener máximo 2 highlights.
- **Sección Renombrada** (`default_template.yaml`): "Proyectos Destacados" → "Proyectos Personales".
- **Educación Formalizada** (`default_template.yaml`): Summary de tesis reescrito con formato `Tesis: "Nombre", descripción`.

---

## [1.2.0] - 2026-03-17

### Added

- **Visor PDF Anti-Flicker**: Arquitectura de doble-renderizado con CSS Grid stacking (`grid-area: 1/1`) que mantiene el PDF anterior visible mientras el nuevo se renderiza en capa invisible, ejecutando swap atómico al completar `onRenderSuccess` de todas las páginas. Revocación diferida de blob URLs (15s) para prevenir errores de timing.
- **Persistencia de Tema**: El tema seleccionado (`selectedDesign`) persiste bidireccionalmente en `localStorage`, eliminando el reset automático a `classic` al cargar nuevas ofertas YAML.
- **Divisor de Paneles Draggable**: Reescritura completa de `split-pane.css` apuntando a las clases reales de `react-split-pane` v3 (`.split-pane-divider.horizontal`) con zona de hit-box transparente de 16px (via `background-clip: padding-box`), drag-handle tipo píldora centrada via `inset: 0; margin: auto`, y feedback visual azul en hover/active.
- **HEU-005**: Documentada la discrepancia crítica de clases CSS entre `react-split-pane` v2 (`.Resizer`) y v3 (`.split-pane-divider`), incluyendo la inversión de nombres de orientación.
- **HEU-006**: Documentado el patrón de doble-renderizado con CSS Grid stacking como solución universal al parpadeo visual en viewers de documentos reactivos.

### Changed

- Nombre de descarga PDF fijado a `Martin_Gil_CV.pdf` en `Toolbar.tsx`.
- Eliminada sobreescritura automática de `selectedDesign` en `handleLoadYaml` de `App.tsx`.
- Eliminado borde derecho redundante del panel editor para evitar artefacto visual de "doble barra" con el divisor.

---

## [1.1.2] - 2026-03-17

### Added

- Desligada a la Inteligencia Artificial del motor de renderizado `uv` para evitar bloqueos de I/O y errores `127` de shell. El flujo modificado (`tailor-cv.md` y `SKILL.md`) deposita el código en `/ofertas` y redirige la atención al usuario hacia el comando local `npm run dev`.
- **HEU-001**: Añadida la Regla Verbal Estricta forzando "Sustantivos Verbales/Nominalización" en la composición ATS de los currículums, anulando por diseño las conjugaciones en primera/tercera persona.
- Nomenclatura Estricta impuesta para el auto-guardado en disco (`cargo_empresa_HH-MM_DD-MMM-YY.yaml`).

---

## [1.1.1] - 2026-03-17

### Added

- Auto-Load UX: La interfaz de previsualización web ahora invoca `FastAPI` asíncronamente en su fase de montaje, capturando el último currículum procesado y dibujándolo por defecto al iniciar `npm run dev` sin requerir input humano.
- Integrados y parcheados mocks `Vitest` y rutinas End-to-End (`Playwright`) con lógica `networkidle` en Chromium para asimilar el nuevo flujo reactivo asíncrono.
- **HEU-004**: Sanitización heurística rigurosa inyectada. Prohibido manipular llaves `design:` originarias para estabilizar el sistema a temas corporativos. Modificado `default_template.yaml` para ceder 100% de autoridad a la nueva ruta `themes/jpmr/`.
- Renombrada clase base en Python de `__init__.py` a `JpmrTheme` para obedecer al compilador pydantic RenderCV.

---

## [1.1.0] - 2026-03-17

### Added

- Arquitectura Frontend Dinámica: Refactorización extrema del `rendercv-web` Toolbar, matando los listados harcodeados.
- Desarrollo de API Endpoints (`web/api`) en FastAPI para servir asincronamente inventarios de diseños (`/themes`), currículums armados (`/CVs`) y ofertas leídas (`/ofertas`), logrando "Resiliencia de File-System" (React no se quiebra si le borran las carpetas nativas base).
- Introducido Test-Driven Development (TDD) End-to-End sobre Chromium mediante Playwright para atajar regresiones gráficas, sumado a Vitest mockups para el DOM.
- Asilamiento Estructural de las plantillas de usuario hacia el root `/themes/` para independizar el motor core de `examples` al inyectar diseños custom.
- Interfaz React Resiliente: El selector de ofertas ("Ofertas Recientes") ahora permanece estático y visible mostrando un placeholder deshabilitado de "No hay ofertas" si la API detecta un directorio limpio, arreglando la desaparición misteriosa del dropwdown.
- **HEU-003**: Parche dogmático para cumplir con el RenderCV Schema Validator (`design.theme`) demandando Lowercase ID's estricto sobre IDs de temas (Ej: `jpmr`).

---

## [1.0.1] - 2026-03-17

### Added

- Nueva estructura de **Directorios de Regulación AI**: `.agent/` con políticas `rules/`, `skills/` y `workflows/`.
- Habilidad `craft-yaml-cv/SKILL.md` (Matchmaker) habilitando a la inteligencia artificial para analizar una oferta contra un perfil empírico sin inyectar alucinaciones y con extremado sigilo ATS.
- Protocolo `tailor-cv.md` para empaquetar ofertas hacia su formato renderizable nativo.
- Inicialización y poblamiento denso de la base `knowledge_base/` con arquitectura de "Technical Stack" importados directamente desde los repositorios fuente (`/home/kirlts/prometeo`, `wirin`, `witral`, etc.).
- Despliegue de los 5 pilares de Gobernanza Documental de Kairós en la carpeta `docs/` aislando la documentación ajena hacia la subcarpeta `rendercv_docs/`.

### Changed

- Refactorizado el flujo de hot-reloading de `rendercv render --watch {file}.yaml` orquestando nativamente el guardado y enrutamiento paramétrico por sobre usar Bash CLI utilities obsoletas.

### Removed

- Dependencia externa de Node.js `chokidar-cli` del archivo `.package.json`.
- Script local de Bash `.agent/scripts/watch-cv.sh`.
