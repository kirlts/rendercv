# Registro de Decisiones de Arquitectura (ADR)

*Este documento captura decisiones que cambian el rumbo del proyecto, los trade-offs asumidos deliberadamente, y los eventos donde el usuario ha impuesto su agencia humana.*

**Formato obligatorio:** `Fecha` | `Contexto` | `Decisión Tomada` | `Trade-offs Asumidos` | `Estado`

---
---

## [2026-03-18] Validación Obligatoria Autosuficiente Pre-Entrega

- **Contexto:** Un CV generado para TCS tenía un highlight con `:` sin comillas (`Applied in QM Validator: JSON-LD...`) que YAML parseaba silenciosamente como dict en vez de string. El frontend lo detectaba instantáneamente, pero el agente no validaba el YAML antes de entregarlo. Los intentos de validar usando `uv run python` eran lentos (~30s+ de cold start). Se intentó usar `curl` contra la API del frontend, pero eso requería `npm run dev` corriendo.
- **Decisión Tomada:** Intervención humana. (1) Nuevo `scripts/validate_yaml.py` que llama directamente a `build_rendercv_dictionary_and_model()` — la misma función que usa el API del frontend — sin depender de ningún servidor. (2) Nueva regla `rules/05-mandatory-validation-protocol.md` que **obliga** al agente a validar cada YAML generado contra este script antes de entregarlo al usuario. Si falla, debe corregir y re-validar en loop. (3) Gate de calidad integrado como Paso 4.5 en `tailor-cv.md`. (4) Cheatsheet de caracteres YAML peligrosos (`:`, `&`, `#`, `!`, `[`, `{`) con soluciones preventivas. (5) Regla de citado preventivo: cualquier string con estos caracteres se envuelve en comillas dobles automáticamente.
- **Trade-offs Asumidos:** El cold start de Python para imports de rendercv toma ~5-10s en la primera ejecución. A cambio, se garantiza que ningún YAML con errores de validación llegue al usuario. El script no requiere ningún servidor corriendo.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] Cargo Sin Nivel de Experiencia en Nombres de Archivo

- **Contexto:** El botón "Guardar CV" generaba archivos como `Martin Gil CV - Senior GenAI Engineer - English.pdf`, incluyendo el nivel de experiencia (Senior) extraído de la JD. El usuario consideró esto incorrecto: el CV debe mostrar el rol funcional, no la seniority.
- **Decisión Tomada:** Intervención humana. Implementación en 3 capas: (1) `tailor-cv.md` Paso 1: instrucción explícita con lista exhaustiva de calificadores prohibidos y ejemplos. (2) `SKILL.md`: reforzado en output_folder y enrutamiento interno. (3) `main.py` endpoint `save-cv`: regex safety net que stripea prefijos de nivel al inicio del cargo.
- **Trade-offs Asumidos:** En casos excepcionales donde "Senior" o "Lead" sea parte integral del nombre del rol (no un calificador), el regex podría stripearlo incorrectamente. Riesgo mínimo dado el mercado laboral actual.
- **Estado:** ✅ Vigente.

---

## [2026-03-18] Soporte Bilingüe CV y Pipeline de Generación EN

- **Contexto:** El usuario necesitaba generar CVs en inglés para postulaciones internacionales, utilizando estándares de redacción anglófonos (action verbs en pasado: "Developed", "Implemented") en lugar de nominalización española. También requerió: (1) detección automática del idioma según la JD, (2) sincronización estructural entre templates, (3) generación creativa de highlights por IA, (4) KB bilingüe.
- **Decisión Tomada:** Intervención humana. (1) Nuevo `default_template_english.yaml` con `locale: english`, secciones en inglés y highlights con action verbs. (2) Nuevo Art. 2 bis en sartorial crafting: regla verbal por idioma. (3) `Condensed Bullets EN` añadidos a las 9 entries de la KB. (4) `04-template-sync-protocol.md`: sincronización por `mtime`. (5) Art. 4 del Gap-Fill ampliado con Modo Creativo. (6) `tailor-cv.md` Paso 1.5: detección automática de idioma (usuario explícito o JD íntegramente en inglés). (7) Backend: `?lang=en|es` en GET/PUT `/api/default-template`. (8) Frontend: dropdown "Plantilla base" (🇪🇸/🇬🇧), botón "Actualizar plantilla (idioma)". (9) Pipeline KB (`extract-knowledge`, Art. 6) actualizado para generar ambas versiones de bullets simultáneamente.
- **Trade-offs Asumidos:** Duplicación en KB (Condensed Bullets ES + EN por entry). Dos templates a mantener en sincronía. A cambio, el sistema genera CVs nativamente bilingües sin depender de traducción on-the-fly del LLM.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] OneLineEntry Styling y Section Titles Fix

- **Contexto:** (1) Los labels de skills en el tema `jpmr` no eran controlables vía sliders frontal. (2) Los labels se estiraban por el `par(justify: true)` global, impidiendo alineación derecha limpia como en el desired template. (3) El slider de secciones mostraba `1.3em` en lugar de `pt`.
- **Decisión Tomada:** Intervención humana. (1) Labels de skills mapeados a `entry_title` size/weight (sliders "Subsecciones"), details a `entry_detail` size/weight (sliders "Sub. detalle"). (2) Columna labels fijada a 5cm con `par(justify: false)` puntual para alineación derecha sin stretch. (3) Default de `section_titles` cambiado de `1.3em` a `12pt` en `__init__.py` y `themes/.overrides/jpmr.json`.
- **Trade-offs Asumidos:** El ancho de 5cm es fijo; labels más largos (ej. "Project Management Methodologies") podrían wrapping. Trade-off aceptable dado los labels actuales del usuario.
- **Estado:** ✅ Vigente.

---

## [2026-03-18] Spacing Sliders, PDF Responsive y Slider CSS Custom

- **Contexto:** (1) El dropdown "Estilo" solo tenía sliders de tamaño y peso, sin control de espaciado. (2) El visor PDF tenía ancho fijo de 800px que no se adaptaba al panel. (3) El slider de peso tenía fondo blanco en Chrome porque `accent-color: #8b5cf6` (purple) produce un track "unfilled" más claro que otros colores.
- **Decisión Tomada:** Intervención humana. (1) Tercer slider de espaciado por campo (cm, 0.05–2.0, step 0.05) con inyección vía `SPACING_YAML_MAP` en `useRenderEngine.ts`. Todos los valores editables por teclado con clamping. "Reiniciar" restaura últimos defaults guardados. (2) PDF se rasteriza a 800px fijo y CSS `width: 100% !important` en `.pdf-page-scaled` escala el canvas para llenar el panel — zero flicker, zero re-rasterización. (3) Sliders usan `appearance: none` + track/thumb custom por clase (`slider-size/weight/spacing`) con `currentColor` heredado, eliminando dependencia de `accent-color` nativo.
- **Trade-offs Asumidos:** (1) Spacing agrega complejidad al state management (7 campos × 3 sliders = 21 controles). (2) CSS scaling del PDF puede perder nitidez si el panel es mucho más ancho que 800px: la resolución del raster no cambia. (3) `appearance: none` elimina el estilo nativo del browser, requiriendo mantenimiento del CSS custom.
- **Estado:** ✅ Vigente.

---

## [2026-03-18] Arquitectura de Condensed Bullets y Remediación Sistémica

- **Contexto:** Un análisis comparativo entre el CV generado por la IA para ACL y la versión corregida manualmente por el usuario reveló 14 fallas sistémicas distribuidas en 4 capas: KB (prosa académica no CV-ready), rules (ausencia de regla de condensación), skill (instrucción de copy-paste), y comportamiento emergente LLM (expansión innecesaria de acrónimos, nominalización recursiva).
- **Decisión Tomada:** Intervención humana. (1) Nueva arquitectura de `Condensed Bullets` en la KB: cada entry contiene exactamente 3 bullets pre-comprimidos y CV-ready; los `Details` se conservan como prosa de referencia. El agente usa Condensed Bullets como fuente primaria. (2) El agente tiene permiso de regenerar Condensed Bullets cuando los Details cambian, manteniendo el estilo existente. (3) Nuevo campo `Subtitle` en proyectos extracurriculares, mapeado al `detail` del YAML. (4) Art. 6 (Condensación Obligatoria) y Art. 7 (Acrónimos de Industria) en `02-cv-sartorial-crafting.md`. (5) Reglas de Orden de Bullets, Keywords de Industria y Subtítulo en SKILL.md. (6) Excepción de Recomendación en Gap-Fill scoped a la oferta laboral. (7) Summary de Educación en `default_template.yaml` enriquecido con keywords permanentes.
- **Trade-offs Asumidos:** Duplicación controlada en la KB (Details + Condensed Bullets por entry). Mayor superficie de mantenimiento. A cambio, el pipeline produce CVs CV-ready sin depender de la capacidad de compresión del LLM, y el usuario tiene control editorial directo sobre los bullets finales.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] Save in CVs Folder (Guardado Directo)

- **Contexto:** No existía forma directa de guardar el PDF renderizado en la carpeta `CVs/` desde el frontend. El usuario debía descargar manualmente y mover el archivo.
- **Decisión Tomada:** Intervención humana. (1) Nuevo endpoint `POST /api/save-cv` que recibe YAML + design, parsea el YAML para extraer el cargo (de `output_folder`, solo la parte antes de ` - `, sin empresa) y el idioma (de `locale.language`), renderiza el PDF, y lo guarda en `CVs/Martin Gil CV - [Cargo] - [Idioma].pdf`. (2) Nuevo botón "Save in CVs" en la Toolbar con estados visuales (loading → saved → idle) posicionado junto a "Download PDF".
- **Trade-offs Asumidos:** El endpoint ejecuta un render completo (no reutiliza el blob URL existente del frontend), lo cual implica ~2-4 segundos extra de latencia. A cambio, garantiza que el PDF guardado siempre refleje exactamente el YAML y design actuales.
- **Estado:** ✅ Vigente.

---

## [2026-03-18] Anti-Solapamiento Experiencia ↔ Proyectos Personales

- **Contexto:** En un CV generado para AI Specialist (ACL), el "Validador QM" aparecía simultáneamente en Experiencia (como parte del rol en UNAB) y en Proyectos Personales, desperdiciando espacio y diluyendo el impacto de ambas secciones.
- **Decisión Tomada:** Intervención humana. (1) Nuevo Art. 5 en `02-cv-sartorial-crafting.md` que prohíbe incluir un proyecto personal si ya está cubierto sustancialmente por una entry de Experiencia (criterio: mismo nombre, misma empresa o ≥50% overlap temático). La Experiencia siempre prevalece. (2) Paso de auditoría cruzada obligatoria en la Fase 2 de `craft-yaml-cv/SKILL.md`. (3) Consolidación de la KB: los bullets únicos del Validador QM fueron absorbidos de `extracurricular.md` → `experience.md`; la sección duplicada fue eliminada.
- **Trade-offs Asumidos:** El agente pierde la capacidad de presentar un mismo proyecto desde dos ángulos diferentes (laboral y personal). A cambio, elimina redundancia y maximiza el espacio disponible en un CV de 1 página.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] Per-Field Font Size/Weight Controls

- **Contexto:** El slider global de peso tipográfico era insuficiente: al bajar el peso del cuerpo, el `#show strong: set text(weight: body+300)` inadvertidamente alteraba el peso de company names. Además, el usuario requería control granular sobre cada campo tipográfico (cuerpo, nombre, titular, contacto, secciones, subsecciones, detalles de subsección).
- **Decisión Tomada:** Intervención humana. (1) Se creó el dropdown "Tamaños" con 7 campos, cada uno con slider de tamaño y peso independiente. (2) Se eliminó la regla `#show strong: set text(weight: body+300)` del Preamble, reemplazándola por `#show strong` con entry_title weight. (3) Se parametrizó `custom_subtitle()` con entry_detail weight/size. (4) Se agregaron `entry_title`/`entry_detail` a `FontSize`/`FontWeight` del jpmr theme. (5) NormalEntry template ampliado con placeholder `DETAIL` para proyectos.
- **Trade-offs Asumidos:** Mayor complejidad en el state management (7 campos × 2 sliders = 14 controles), a cambio de control tipográfico quirúrgico sin efectos colaterales entre campos.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] Botones Save con Persistencia Offline

- **Contexto:** No existía forma de guardar cambios desde la UI: el editor de ofertas no podía sobreescribir el YAML fuente, y los ajustes de tamaño/peso se perdían al cambiar de theme.
- **Decisión Tomada:** Intervención humana. (1) Botón 💾 junto a Ofertas que ejecuta `PUT /api/ofertas/{filename}` sobreescribiendo el YAML seleccionado. (2) Botón "Guardar" en Tamaños que ejecuta `PUT /api/theme-defaults/{theme_id}` persistiendo defaults en JSON sidecar (`themes/.overrides/`). GET endpoint carga overrides antes de computar defaults. Ambos botones muestran feedback visual ✓ verde durante 1.5s.
- **Trade-offs Asumidos:** La API ahora puede sobreescribir archivos en disco (ofertas y defaults de theme). Requiere confianza en el usuario local.
- **Estado:** ✅ Vigente.

---

## [2026-03-17] Protocolo de Gap-Fill: Template como Lienzo Pre-Rellenable

- **Contexto:** Se desarrolló una lógica en el frontend para que el usuario pueda pre-rellenar parcialmente el `default_template.yaml` antes de invocar a la IA, fijando ciertos elementos (experiencias, highlights específicos) y dejando otros vacíos o con instrucciones entre corchetes para que la IA los complete.
- **Decisión Tomada:** Intervención humana. Se creó una nueva regla (`03-gap-fill-protocol.md`) que define 4 estados de clasificación para cada campo del template: VACÍO (libertad total), FIJADO (intocable), PARCIAL (rellena solo los slots vacíos), INSTRUIDO (interpreta instrucciones `[...]`). Se modificaron `SKILL.md`, `tailor-cv.md` y `default_template.yaml` para referenciar este protocolo. La IA tiene prohibido parafrasear, eliminar o reordenar contenido fijado por el usuario.
- **Trade-offs Asumidos:** El agente pierde libertad total de composición cuando el template viene pre-rellenado; gana precisión quirúrgica al actuar solo sobre los gaps. Mayor complejidad en las instrucciones del agente, a cambio de control granular del usuario sobre el output final.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-18] Soberanía Estructural del Template (Template-Driven Architecture)

- **Contexto:** Las reglas cuantitativas deterministas ("exactamente 3 highlights", "2 proyectos con 3 highlights c/u") eran hardcoded en el `.agent/`. Esto impedía que el usuario pudiera controlar la estructura del CV desde el frontend (ej. agregar una sección `Publicaciones`, cambiar la cantidad de highlights por entry).
- **Decisión Tomada:** Intervención humana. Se eliminaron TODAS las cantidades y nombres de sección hardcodeados del `.agent/`. El `default_template.yaml` es la única fuente de verdad estructural: secciones, entries y highlights. Se añadió Art. 6 al Gap-Fill Protocol: la IA no puede crear, eliminar ni renombrar secciones que no existan en el template. La restricción de 1 página se suavizó con escape valve: si el template tiene demasiado contenido fijado, la IA advierte al usuario.
- **Trade-offs Asumidos:** La IA pierde la capacidad de decidir autónomamente la densidad óptima cuando el template está vacío (debe estimar). A cambio, el usuario tiene control total de la estructura desde el frontend.
- **Estado:** ✅ Vigente y Enforced. Supersede la decisión "Reglas Cuantitativas Deterministas".

---

## [2026-03-17] Reglas Cuantitativas Deterministas para CV

- **Contexto:** El CV generado para "Líder de Desarrollo · Proyectum" tenía cantidades inconsistentes de bullet points (4 para UAH, 3 para UNAB, 2 para Sotos), solo 1 proyecto en vez de 2, y los proyectos no incluían hipervínculos a sus URLs pese a estar documentadas en la KB.
- **Decisión Tomada:** Intervención humana. (1) Exactamente 3 highlights por experiencia profesional (excepción: máximo 2 para prácticas, preservada por feedback del usuario). (2) Sección Proyectos Personales declarada obligatoria con exactamente 2 proyectos y 3 highlights cada uno. (3) Hipervínculo markdown obligatorio en el campo `name` de proyectos con URL documentada en la KB.
- **Trade-offs Asumidos:** Menor flexibilidad del agente para adaptar la densidad de bullets según la relevancia de cada experiencia; a cambio, consistencia visual garantizada y eliminación de variabilidad entre generaciones.
- **Estado:** ⚠️ **SUPERSEDED** por "Soberanía Estructural del Template". Las cantidades ya no son hardcodeadas; las define el template. La regla de hipervínculos se mantiene vigente.

---

## [2026-03-17] Replicación Visual 1:1 y Restauración de Source Sans 3

- **Contexto:** El tema `jpmr` no producía un CV visualmente idéntico al desired template (`(desired template)_original_cv-2.png`). La fuente era Inter en lugar de Source Sans 3, el spacing era demasiado holgado (resultado de 2 páginas), y las líneas de sección eran grises en vez de negras.
- **Decisión Tomada:** Intervención humana. (1) Se revirtió la fuente a Source Sans 3 tras análisis tipográfico comparativo contra la desired template. (2) Se ajustó TODO el spacing uniformemente: `line_spacing: 0.6em`, header `0.15/0.15/0.3cm`, sections `0.35/0.12cm`, entries `0.5em`. (3) Se restauró `justify: true` con `hyphenate: false`. (4) Líneas de sección cambiadas a negro puro. (5) Se añadió `font_weight` como campo configurable en Typography con inyección condicional en Typst (omite si weight=400).
- **Trade-offs Asumidos:** El spacing es extremadamente compacto; CVs con más contenido que el desired template podrían requerir ajustes manuales de spacing o paginación. La fuente Source Sans 3 es menos universalmente instalada que Inter.
- **Estado:** ✅ Vigente.

---

## [2026-03-17] Toolbar: Load Default Template, Update Template y Reducción 25%

- **Contexto:** El usuario necesitaba: (1) editar la plantilla base (`default_template.yaml`) directamente desde la UI para que futuras generaciones de IA usen esa versión actualizada, (2) que la barra superior no desbordara en pantallas pequeñas, (3) que los elementos fueran más compactos.
- **Decisión Tomada:** Intervención humana. (1) Se añadió botón "Default" que carga `default_template.yaml` vía nuevo endpoint `GET /api/default-template`. (2) Se implementó lógica condicional: si el contenido fue cargado desde default template y el usuario lo modifica, "Download PDF" se convierte en "Update Template" (naranja), que ejecuta `PUT /api/default-template` y revierte al estado "Download PDF" al guardarse. (3) Todos los elementos de la Toolbar reducidos 25% permanentemente con `flex-wrap` para responsividad.
- **Trade-offs Asumidos:** La API ahora puede sobreescribir archivos en disco (`default_template.yaml`), lo cual requiere confianza en el usuario local. Mayor complejidad en el estado de App.tsx (3 nuevas variables: `defaultTemplateContent`, `isDefaultTemplateLoaded`, `isTemplateModified`).
- **Estado:** ✅ Vigente.

---

## [2026-03-17] Auditoría Post-Generación: Remediación de 11 Defectos Sistémicos

- **Contexto:** Tras generar un CV para "Líder de Desarrollo · Proyectum Chile", el usuario auditó manualmente el output identificando 11 defectos reproducibles categorizados en 3 orígenes: errores factuales en la Knowledge Base (4), gaps en reglas/skill (5), y valores hardcodeados incorrectos en el template (2). Cada defecto fue trazado a su archivo raíz exacto.
- **Decisión Tomada:** Intervención humana. (1) **Headline inmutable**: el agente no modifica el headline bajo ninguna circunstancia sin instrucción explícita. (2) **Anti-inyección de JD**: nueva regla prohibiendo insertar lenguaje del Job Description en bullets de experiencia como hechos vividos. (3) **Corrección factual del KB**: los datos de `experience.md` fueron verificados contra `raw dumps/linkedin-text.txt` como fuente de verdad, corrigiendo inflación terminológica ("M2M"), pérdida de contexto (FONDECYT), y degradación de especificidad ("papers" → "documentos técnicos"). (4) **Prohibición de em-dashes** como anti-AI-tell. (5) **Buzzwords en español** añadidas a la lista negra. (6) **Traducción flexible** de cargos (solo cuando existe equivalente natural, preservando términos de industria). (7) **Calificador de prácticas** preservado obligatoriamente. (8) **Sección renombrada** de "Proyectos Destacados" a "Proyectos Personales". (9) **Educación formalizada** con descripción de tesis.
- **Trade-offs Asumidos:** Mayor rigidez del agente (menos autonomía creativa sobre headline, lenguaje, y adaptación al JD), a cambio de eliminación total de alucinaciones, inflación y AI-tells en los CVs generados.
- **Estado:** ✅ Vigente y Enforced.

---

## [2026-03-17] Inicialización de la Knowledge Base y Reglas de Sigilo Sintáctico

- **Contexto:** Se notó que la IA inyectaba "AI-Tells", vocabulario genérico y viñetas redundantes al generar iteraciones del Currículum para burlar ATS. La información también era dispersa y poco densa (Ejemplo: poner toda la experiencia en un solo string lineal).
- **Decisión Tomada:** Intervención humana. Creación de la sub-red modular de archivos Markdown dentro de `knowledge_base/` con una estructura granular fuertemente tipada ("Technical Stack"). Acompañado de la institucionalización estricta de Reglas, Skills y Workflows bajo `/home/kirlts/rendercv/.agent/` para que la IA actúe como un "Sastre" filtrando anti-patrones en el render final.
- **Trade-offs Asumidos:** Menos pragmatismo inicial. En vez de "solo pedir un CV rápido", hay que mantener viva la matriz de Knowledge y sus regulaciones asociadas.
- **Estado:** ✅ Vigente y Enforced.

## [2026-03-17] Cambio de Paradigma: Sustitución de BASH Spy por Inyección Nativa YAML (RenderCommand)

- **Contexto:** Para facilitar el auto-nombrado de currículums (ej. depositarlos directamente en `../CVs/[Cargo] - [Empresa]/`) y no en la carpeta output local, se había acoplado la ejecución a una dependencia ajena (`chokidar-cli`) con scripts Bash orquestando el guardado vía `mv`.
- **Decisión Tomada:** Se intervino tácticamente, y por solicitud humana, la estructura base eliminando los Bash Scripts. Como reemplazo se utilizó la sintaxis nativa de RenderCV inyectando dinámicamente la subllave `settings.render_command` directo en cada YAML compilado para desviar las rutas de salida directamente localizadas al ejecutar un `rendercv render --watch {archivo}`.
- **Trade-offs Asumidos:** La plantilla base de YAML y la skill de generación AI se volvieron más rígidas en sintaxis (exigiendo un footer preestablecido), a cambio eliminamos una capa inestable en dependencias NPM innecesarias.
- **Estado:** ✅ Vigente.

## [2026-03-17] Desacoplamiento de Constantes React y Nacimiento de API Dinámica

- **Contexto:** Al desarrollar `rendercv-web` (React UI), el dropdown de de diseños (*themes*) y el lector de YAMLs dependían de arrays (*enums*) escritos rígidamente. Agregar o eliminar una oferta en la terminal provocaba inconsistencias silentes en el DOM de React.
- **Decisión Tomada:** Se eliminaron las interfaces y listados harcodeados construyendo en su lugar múltiples Endpoints vía `FastAPI` (Ej: `/api/themes`, `/api/ofertas`). Estos parsers vigilan el file-system del proyecto en tiempo real comunicando la verdad sincrónica a la Toolbar del cliente.
- **Trade-offs Asumidos:** Reactivismo y mayor latencia por ida/vuelta HTTP; el frontend no se rompe incluso si la IA o el usuario humano borra caprichosamente todas las carpetas del repositorio desde cero (Comportamiento Resiliente Blindado).
- **Estado:** ✅ Vigente.

## [2026-03-17] Asilamiento Estructural de Temas Personales (`/themes`) e Identificadores Lowercase

- **Contexto:** Se intentó compilar con un tema bajo la estructura `examples/JPMR/`, lo cual chocaba con el validador Pydantic del compilador de RenderCV genererando una fatalidad (RenderCVValidationError).
- **Decisión Tomada:** Intervención humana. Por regla estricta de compilador, los identificadores de diseños persosnalizados deben ser netamente Minúsculas. Se extrajo este y cualquier otro diseño ajeno hacia la nueva raíz `/themes/[id-tema]/` para no contaminar carpetas `examples` del núcleo. El backend API asume el parseo de mayúsculas para deleite del usuario en pantalla, mientras procesa minúsculas a bajo nivel sintáctico en YAML.
- **Trade-offs Asumidos:** Menor naturalidad gráfica para un humano redactando a mano. Modificación a las expresiones regulares y unit tests.
- **Estado:** ✅ Vigente.

## [2026-03-17] Adopción Mandataria de Test-Driven Development (TDD) End-to-End

- **Contexto:** La volatilidad al conectar un pipeline de Python nativo (Generador PDF) con una UI Visual React acarreaba riesgos de regresión severos.
- **Decisión Tomada:** Se estipula mediante TDD que todos los compomnentes de la barra de control cuenten con mocks virtuales asíncronos en `Vitest`, y un suite entero de *browsing-behavior* en `Playwright` asegurándose que Chromium pueda levantar, procesar e interpretar interacciones completas antes de consolidar cambios gráficos.
- **Trade-offs Asumidos:** Una fase de testing adicional, extendiendo el ciclo de iteración en ~15 segundos extras.
- **Estado:** ✅ Vigente y Enforced.

## [2026-03-17] Comportamiento Autónomo Frontend (Auto-Load)

- **Contexto:** Al montar el entorno de desarrollo `npm run dev`, React cargaba la plantilla por defecto estática. El usuario se veía forzado a hacer click manual en el dropdown de Ofertas para ver el PDF generado por la IA en la sesión anterior.
- **Decisión Tomada:** Se transformó el estado de `<select>` a un componente "Controlado" por React. Se programó un fetch asíncrono en `useEffect` que carga obligatoriamente el currículum más reciente disponible en disco auto-seleccionando por defecto la plantilla `jpmr`. También se programó a `Playwright` para esperar a red inactiva (`networkidle`) evitando race-conditions.
- **Trade-offs Asumidos:** Inversión de tiempo en TDD; el framework ahora depende más de la respuesta rápida de FastAPI al inicio; ganancia extrema en la velocidad visual del flujo IA -> PDF.
- **Estado:** ✅ Vigente.

## [2026-03-17] Desligar a la IA del Comando de Compilación PDF

- **Contexto:** La IA fallaba o alucinaba comandos al tratar de compilar el YAML generado (ej. olvidando invocar al gestor de dependencias `uv`), deteniendo iteraciones o creando archivos en rutas muertas.
- **Decisión Tomada:** Se liberó a las Skills y Workflows de IA (`craft-yaml-cv` y `tailor-cv`) de la responsabilidad de renderizar el archivo final. Ahora el agente deposita silenciosamente el `.yaml` en `ofertas/[cargo...]` y le cede el control al usuario instruyéndolo a ejecutar `npm run dev` para previsualizar el CV renderizado por el frontend en tiempo real.
- **Trade-offs Asumidos:** Menos "Caja Mágica", mayor participación humana en el último paso (iniciar el servidor de previsualización web). Eliminación contundente de bloqueos de I/O y fallos de shell en el generador LLM.
- **Estado:** ✅ Vigente.

## [2026-03-17] Adopción de "Sustantivos Verbales" Estrictos en YAML Crafting

- **Contexto:** Al adaptar los currículums desde la Knowledge Base al YAML ATS, la IA reaccionaba literalmente a la plantilla ("Verbo Fuerte") conjugando todas las viñetas rígidamente en primera ("Desarrollé") o tercera persona ("Desarrolló").
- **Decisión Tomada:** Mediante intervención humana en `craft-yaml-cv/SKILL.md`, se forzó una "Regla Verbal Estricta": uso mandatorio de "Sustantivos Verbales/Nominalización" (ej. *Desarrollo de...*, *Liderazgo en...*).
- **Trade-offs Asumidos:** Ninguno; se asegura una redacción técnica inmaculada, más formal e impersonal que se adapta al estándar ejecutivo de la industria de software y ATS corporativos.
- **Estado:** ✅ Vigente y Enforced.

## [2026-03-17] Persistencia de Tema Visual en localStorage

- **Contexto:** Al cambiar entre ofertas YAML recientes usando el dropdown de la Toolbar, el tema visual seleccionado (ej. `jpmr`) revertía automáticamente a `classic` porque `handleLoadYaml` sobreescribía el estado `selectedDesign` con lo que detectaba en el YAML cargado.
- **Decisión Tomada:** Intervención humana. Se eliminó la lógica de sobreescritura automática de tema en `handleLoadYaml` y se implementó persistencia bidireccional del `selectedDesign` mediante `localStorage`, inicializando desde `localStorage` al montar y escribiéndolo con `useEffect` en cada cambio.
- **Trade-offs Asumidos:** La "intención del autor original" del YAML (si tenía un `design.theme` distinto) se ignora al cargar; el usuario siempre verá su tema preferido hasta que lo cambie manualmente.
- **Estado:** ✅ Vigente.

## [2026-03-17] Arquitectura de Doble-Renderizado PDF Anti-Flicker

- **Contexto:** Al editar el YAML en el editor, el panel derecho parpadeaba visualmente (fondo gris/blanco momentáneo) cada vez que se re-renderizaba el PDF. El usuario exigió cero parpadeo visual.
- **Decisión Tomada:** Intervención humana. Se implementó una arquitectura de doble-renderizado utilizando CSS Grid apilado (`grid-area: 1/1`) donde el nuevo PDF se renderiza en una capa invisible (`opacity: 0`, `z-index: 0`) mientras el anterior permanece visible (`opacity: 1`, `z-index: 1`). Solo cuando TODAS las páginas del nuevo PDF disparan `onRenderSuccess`, se ejecuta un swap atómico de visibilidad y se limpia el PDF anterior. Las blob URLs antiguas se revocan con 15s de delay para evitar errores de timing.
- **Trade-offs Asumidos:** Mayor consumo de memoria (dos PDFs en DOM simultáneamente durante la transición); complejidad significativamente mayor en `PDFViewer.tsx` con estados `readyPdfs` y refs para gestionar el ciclo de vida de cada versión del documento.
- **Estado:** ✅ Vigente.

## [2026-03-17] Nombre Fijo de Descarga PDF y Corrección de Clases CSS Split-Pane

- **Contexto:** (1) El botón "Download PDF" generaba el archivo con nombre genérico `rendercv_output.pdf`. (2) El divisor entre paneles era invisible porque `react-split-pane` v3 usa la clase `.split-pane-divider` (no `.Resizer` como la v2) y la orientación `.horizontal` para paneles lado-a-lado (contraintuitivamente).
- **Decisión Tomada:** (1) Se hardcodeó `Martin_Gil_CV.pdf` como nombre de descarga. (2) Se reescribió completamente `split-pane.css` apuntando a los selectores reales (`.split-pane-divider.horizontal`) con zona de hit-box de 16px transparente, drag-handle tipo píldora y feedback visual azul en hover/active.
- **Trade-offs Asumidos:** (1) Nombre de descarga no-dinámico; si cambia el usuario del CV, hay que editar manualmente `Toolbar.tsx`. (2) Se mantienen reglas legacy `.Resizer` como fallback por si se cambia la versión de la librería.
- **Estado:** ✅ Vigente.
