# Códice Heurístico de Kairós (MEMORY)

*Este es el banco de memoria activa de Kairós para el fork RenderCV-AG. Cada bloque es un conocimiento granular derivado de la experimentación o la confirmación humana que DEBE ser transferido entre sesiones para evitar sobre-explicaciones.*

---

## [HEU-001] "Anti-Patrones de CV y Sigilo Sintáctico"

- **Contexto:** Se requiere orquestar la generación de un YAML CV apto para evadir ATS. La IA por defecto tiende a escribir adjetivando la primera persona y abusar de listas.
- **Aprendizaje:** La redacción exitosa para este ecosistema es SECA, DIRECTA y en TERCERA PERSONA implícita. Prohibido "Como parte de mi rol..." o "Participé activamente". Únicamente: `[Sustantivo Verbal Fuerte] + [Impacto/Tecnología] + [Resultado]`. Por **Regla Verbal Estricta**, no se deben usar verbos conjugados (ej. "Desarrolló", "Lideró"), sino nomilizaciones o sustantivos verbales (ej. "Desarrollo", "Liderazgo"). Ningún adorno ni uso de paréntesis sobre-explicativos.
- **Trigger:** Al redactar un nuevo CV al detonar `.agent/skills/craft-yaml-cv/SKILL.md`.

## [HEU-002] "Configuraciones Nativas de Destino"

- **Contexto:** Existía una dicotomía sobre cómo capturar archivos de renderizado (`rendercv_output/*.pdf`) para dirigirlos a sus carpetas corporativas específicas (`CVs/[Empresa]`).
- **Aprendizaje:** El comando bash `mv` es inseguro frente al asíncronismo y los watchers. La arquitectura requiere que todo archivo origen YAML inyecte tácticamente el grupo de parámetros `settings.render_command` apuntando nativamente al output folder `../CVs/[Cargo] - [Empresa]/`. Esto provee *Hot Reloading* silencioso y blindado.
- **Trigger:** Al iniciar una sesión, ante requerimientos de "No se actualiza el PDF recién editado", validar que el archivo posea el footer pre-inyectado de orquestación RenderCommand.

## [HEU-003] "Validación Estricta de Temas Custom"

- **Contexto:** Al extraer una plantilla hacia la nueva carpeta root `/themes/JPMR` e intentar compilar, RenderCV devolvió un `RenderCVValidationError`.
- **Aprendizaje:** El schema validador Pydantic interno de RenderCV que procesa la llave `design.theme` requiere de forma **estricta y dogmática** que el identificador del tema personalizado esté compuesto exclusivamente por **letras minúsculas y/o números**, además de coincidir exactamente con el nombre de la clase Python exportada en el `__init__.py` de dicho tema (Ej: `jpmr` -> `class JpmrTheme`). Las mayúsculas solo deben manejarse sintéticamente a nivel presentacional de UI por React, *nunca* en el File-System o en el YAML originario.
- **Trigger:** Al bifurcar, clonar o aislar proyectos bajo un nuevo theme ID custom.

## [HEU-004] "Soberanía Estricta del Tema Centralizado"

- **Contexto:** Se intentó pre-configurar estéticas visuales detalladas (como `top_margin` o `font_size`) directamente sobre las plantillas inyectadas como `default_template.yaml`.
- **Aprendizaje:** Cualquier bloque dentro de `design:` que no sea estrictamente `theme:` es un "override" letal. Estos parches de usuario anulan arbitrariamente la cascada CSS/Typst del tema pre-establecido en `/themes/`, destruyendo la predictibilidad de diseño que exige el proyecto. El archivo YAML a rellenar por el agente debe ser lo más escueto posible visualmente, confiriendo 100% de la autoridad compiladora al submotor del framework.
- **Trigger:** Al depurar CVs renderizados con márgenes rotos o fuentes erróneas que no deberían depender de la oferta, verificar que el YAML base no contenga overrides de diseño.

## [HEU-005] "Discrepancia de Clases CSS en react-split-pane v3"

- **Contexto:** Se dedicaron múltiples iteraciones escribiendo CSS para la clase `.Resizer.vertical` que nunca se aplicaba, resultando en un divisor de paneles invisible pese a reglas que incluían `!important`.
- **Aprendizaje:** La librería `react-split-pane` v3.x cambió **completamente** sus clases CSS internas. Donde la v2 usaba `.Resizer`, la v3 usa `.split-pane-divider`. Adicionalmente, la v3 invierte la terminología de orientación: un divisor que separa paneles **lado a lado** (izquierda/derecha) recibe la clase `.horizontal` (no `.vertical`). Antes de escribir CSS para cualquier librería de componentes, **siempre inspeccionar el DOM real** para verificar qué clases inyecta la versión instalada, en vez de asumir basándose en documentación o convenciones.
- **Trigger:** Al estilizar componentes de terceros (split panes, modals, drawers, etc.) y los estilos CSS no surten efecto visible.

## [HEU-006] "Patrón de Doble-Renderizado Anti-Flicker para Viewers PDF/Documentos"

- **Contexto:** Múltiples intentos de eliminar el parpadeo del visor PDF (badges de carga, opacity parcial, fondos blancos) fallaron porque todos causaban al menos 1 frame de transición visible.
- **Aprendizaje:** El patrón probado es **CSS Grid stacking**: ambas versiones del documento (vieja y nueva) coexisten en el mismo `grid-area: 1/1`. La nueva se renderiza con `opacity: 0` y `z-index: 0` (invisible pero activamente pintándose). Solo cuando `onRenderSuccess` dispara para TODAS las páginas, se ejecuta un swap atómico (`opacity: 1` al nuevo, cleanup del viejo). Las blob URLs del documento anterior deben revocarse con delay (≥15s) porque el navegador puede seguir referenciándolas durante la transición.
- **Trigger:** Al implementar cualquier viewer de documentos reactivo (PDF, imágenes, Markdown preview) que necesite actualizaciones sin parpadeo.

## [HEU-007] "Em-Dashes y Dobles Guiones como Principal AI-Tell Estilístico"

- **Contexto:** Un CV generado por el agente fue auditado por el usuario, quien identificó el uso del carácter `—` (em-dash) como el marcador de escritura por IA más obvio que existe en documentos profesionales.
- **Aprendizaje:** Los em-dashes (`—`) y los dobles guiones (` -- `) son un patrón estilístico casi exclusivo de LLMs. Los humanos hispanohablantes rara vez los usan en documentos técnicos o CVs. Cualquier pipeline de generación de texto profesional debe incluir esta prohibición explícitamente en sus reglas, o el output será detectado como IA de forma trivial. La solución es reestructurar la oración usando comas, puntos, o dos oraciones separadas.
- **Trigger:** Al redactar cualquier documento que deba pasar por un revisor humano o un detector ATS.

## [HEU-008] "Inyección de Lenguaje del JD en Experiencia como Patrón de Alucinación"

- **Contexto:** Un CV generado para "Líder de Desarrollo" inyectó la frase "asegurando entregas integradas con equipos de QA y operaciones" en la experiencia de UAH. Esta frase no existía en la knowledge_base; provenía textualmente del JD que pedía "coordinar con áreas de QA, DevOps y operaciones".
- **Aprendizaje:** Los LLMs tienen un sesgo fuerte a "complacer" el JD inyectando sus requerimientos como si fueran hechos vividos por el candidato. Esto es una forma de alucinación sutil porque el resultado "suena correcto" pero es factualmente falso. La mitigación requiere una regla explícita que separe los dos usos del JD: (1) SELECCIONAR qué experiencias incluir (permitido), (2) REESCRIBIR las experiencias para que incluyan lo que el JD pide (prohibido).
- **Trigger:** Al generar cualquier documento que combine una fuente de hechos (KB) con un objetivo de matching (JD/prompt de usuario).

## [HEU-009] "Peso Tipográfico Explícito en Typst Altera Spacing por Defecto"

- **Contexto:** Al implementar un selector de peso de fuente (font weight) para el tema `jpmr`, se descubrió que aplicar `#set text(weight: 400)` explícitamente en Typst producía un layout sutilmente diferente al omitir la directiva por completo (comportamiento por defecto de Typst).
- **Aprendizaje:** En Typst, el weight por defecto es 400, pero declarar explícitamente `weight: 400` puede alterar la métrica tipográfica interna comparado con no declararla. La solución correcta es usar lógica condicional en el template Jinja: solo emitir `#set text(weight: N)` cuando el valor es **diferente** de 400. Para negritas (`#show strong`), el patrón original `min(weight + 300, 900)` fue reemplazado por el sistema `entry_title` weight/size que controla bold text independientemente del body weight. Esta heurística aplica a cualquier motor de renderizado donde los defaults implícitos pueden diferir de los explícitos.
- **Trigger:** Al implementar configurabilidad de peso tipográfico en templates Typst/LaTeX/CSS donde exista un valor "por defecto" implícito.

## [HEU-010] "Reglas Cuantitativas Deterministas vs Rangos Ambiguos"

- **Contexto:** El SKILL.md indicaba "máximo de 3 a 5 detalles clave" por experiencia. La generación produjo 4 bullets para UAH, 3 para UNAB y 2 para Sotos, una variabilidad inaceptable que el usuario detectó inmediatamente. La sección de Proyectos estaba marcada como "opcional", resultando en una inclusión inconsistente.
- **Aprendizaje:** Las instrucciones al agente DEBEN ser deterministas cuando se requiere consistencia visual: "exactamente 3 highlights", no "3 a 5". Los rangos ambiguos invitan al LLM a aplicar su propio criterio discrecional, que no es reproducible. **Evolución**: este principio se llevó al extremo con la Arquitectura Template-Driven: en vez de hardcodear las cantidades en las reglas del agente, se delegó al `default_template.yaml` como fuente de verdad estructural. El template define cuántos entries y highlights tiene cada sección; la IA los respeta sin cuestionar. El determinismo se conserva pero ahora es controlado por el usuario desde el frontend, no por reglas estáticas.
- **Trigger:** Al definir instrucciones para agentes generativos que producen documentos con estructura visual fija (CVs, informes, propuestas).

## [HEU-011] "Body Weight + #show strong: Canal de Propagación Inadvertido en Typst"

- **Contexto:** Al implementar sliders per-field de peso tipográfico, bajar el peso del cuerpo (body) tenía el efecto colateral de agrandar los nombres de empresas (company names) renderizados con `*bold*` markdown.
- **Aprendizaje:** La regla `#show strong: set text(weight: body + 300)` propaga cualquier cambio en body weight a todos los elementos `#strong[...]` del documento. Si body weight baja de 400 a 300, strong baja de 700 a 600, produciendo un efecto visual perceptible. La solución es desacoplar completamente: `#show strong` debe usar un peso fijo independiente (entry_title weight) que el usuario controla por separado, no un cálculo derivado del body weight.
- **Trigger:** Al implementar configurabilidad per-field en sistemas tipográficos con herencia (CSS `font-weight: bolder`, Typst `#show strong`, LaTeX `\textbf`).

## [HEU-013] "Copy-Paste Explícito como Causa Raíz de Calidad Paupérrima en CVs Generados"

- **Contexto:** Un CV generado para AI Specialist (ACL) fue comparado contra la versión corregida manualmente por el usuario. El análisis reveló 14 fallas sistémicas. La causa raíz dominante fue que la instrucción del SKILL.md decía explícitamente "copy-paste puliendo lo mínimo", lo cual incentivó al LLM a copiar textualmente los bullets verbosos de la KB en lugar de comprimirlos.
- **Aprendizaje:** Las instrucciones de "copy-paste" son tóxicas en pipelines de generación de documentos profesionales. Los LLMs las interpretan literalmente y producen outputs inflados. La solución es separar la KB en dos capas: (1) `Details` como prosa descriptiva completa (fuente de verdad factual), y (2) `Condensed Bullets` como versiones pre-comprimidas CV-ready (fuente primaria para el agente). El agente NUNCA debe copiar textualmente los Details; siempre debe partir de los Condensed Bullets. Adicionalmente, los acrónimos de industria (AWS, GCP, CI/CD) nunca deben expandirse: el LLM tiene un sesgo a expandirlos para "parecer más completo", pero esto desperdicia espacio y delata escritura automatizada. Una sola capa de nominalización: "Implementación de X", nunca "Implementación de prácticas de orquestación de X".
- **Trigger:** Al diseñar instrucciones para agentes que generan documentos con restricciones de espacio (CVs, resúmenes ejecutivos, abstracts).

## [HEU-012] "custom_subtitle como Canal Exclusivo de Entry Detail Styling"

- **Contexto:** Se intentó aplicar entry_detail styling separando company y position en el template Jinja mediante split por coma, pero el contenido pre-renderizado de `entry.main_column` ya contenía funciones Typst (`#strong[Company]`, `#custom_subtitle("Position")`) que no podían splittearse con lógica de strings.
- **Aprendizaje:** En el pipeline jpmr, `entry.main_column` se renderiza antes de llegar al template Jinja. El company name ya es `#strong[...]` y la position ya es `#custom_subtitle(...)`. La única forma de controlar entry_detail styling es parametrizar la propia función `custom_subtitle()` en el Preamble con weight/size del theme, NO intentar re-parsear el contenido en el template. El patrón generalizable es: cuando el contenido llega pre-procesado con funciones de formato, los controles de estilo deben vivir en las definiciones de esas funciones, no en los consumidores.
- **Trigger:** Al intentar aplicar styling a contenido que ya ha sido procesado por un pipeline de rendering previo.

## [HEU-014] "CSS `width: 100%` en Canvas PDF como Solución Universal de Scaling"

- **Contexto:** Se implementó un visor PDF responsive que debía escalar fluidamente al redimensionar el panel divisor. Los intentos con `ResizeObserver` + cambio dinámico de `width` en react-pdf causaban re-rasterización y parpadeo. Los intentos con `transform: scale()` causaban desalineamiento (el layout box no cambia). Los intentos con debounce seguían parpadeando al re-render.
- **Aprendizaje:** La solución correcta es renderizar el canvas PDF a un ancho fijo (800px) y usar CSS `width: 100% !important; height: auto !important` en el canvas y sus layers (texto, anotaciones). El browser escala el resultado via CSS sin re-rasterización, sin flicker, y sin cálculos JS. El PDF siempre llena el espacio horizontal. La calidad es suficiente para preview; si el panel es más ancho que 800px, se pierde algo de nitidez. La clase `.pdf-page-scaled` se aplica al componente `Page` de react-pdf.
- **Trigger:** Al implementar vizualizadores de documentos (PDF, imágenes, SVG) que deban adaptarse al tamaño de su contenedor sin parpadeo.

## [HEU-015] "`accent-color` Produce Track Colors Variables por Browser"

- **Contexto:** Los range sliders de peso (accent-color `#8b5cf6` purple) tenían un track "unfilled" blanco/claro en Chrome, mientras que los de tamaño (red) y espaciado (teal) tenían track gris oscuro. Se intentó `background: transparent`, `color-scheme: dark`, y `::-webkit-slider-runnable-track` con background — ninguno funcionó sin romper el look nativo.
- **Aprendizaje:** En Chrome/Chromium, la propiedad CSS `accent-color` no solo colorea la parte "filled" del track sino que DERIVA el color "unfilled" automáticamente. Para colores claros como purple (`#8b5cf6`), el track derivado es muy claro (casi blanco). Este comportamiento es interno del browser y no se puede controlar con CSS estándar. La única solución confiable es `appearance: none` + styling custom completo (track + thumb) para TODOS los sliders, no solo el problemático. Se usan clases por tipo (`slider-size`, `slider-weight`, `slider-spacing`) con `color: [hex]` y `background: currentColor` en el thumb para mantener colores diferenciados.
- **Trigger:** Al usar `accent-color` en elementos `input[type="range"]` y observar colores de track inconsistentes entre diferentes valores de accent-color.

## [HEU-016] "YAML Flow Sequences: `[texto]` se Parsea como Array"

- **Contexto:** El `default_template.yaml` usaba corchetes `[...]` como placeholders para instrucciones del agente (ej. `[Seleccionar 3 highlights relevantes]`). Al intentar guardar el template como nuevo default, el parser YAML fallaba con `RenderCVValidationError: while parsing a flow sequence`.
- **Aprendizaje:** En YAML, los corchetes `[` ... `]` son sintaxis de **flow sequence** (arrays inline). Cuando un campo contiene texto entre corchetes sin estar entrecomillado, el parser YAML intenta parsearlo como un array, fallando. La solución es reemplazar los corchetes con guillemets `«...»` que no tienen significado sintáctico en YAML. Alternativamente, se pueden entrecomillar los strings completos, pero esto añade ruido visual al template. Los guillemets preservan la semántica visual de "instrucción para el agente" sin conflicto con el parser.
- **Trigger:** Al usar placeholders o instrucciones en archivos YAML que contengan caracteres que puedan ser interpretados como sintaxis YAML (`[`, `{`, `:`, `#`, etc.).

## [HEU-017] "YAML Colon en Strings: Key-Value Parse Silencioso"

- **Contexto:** Un CV generado para TCS falló con `RenderCVValidationError: Input should be a valid string` en `highlights[1]` de Personal Projects. El highlight era `- Applied in QM Validator: JSON-LD injection as structural anchor...`. El frontend detectaba el error instantáneamente pero el agente no podía reproducirlo.
- **Aprendizaje:** En YAML, el carácter `:` seguido de un espacio dentro de un list item (`- texto: más texto`) hace que el parser lo interprete como un **key-value pair** (dict `{texto: más texto}`) en vez de un string. A diferencia del `&` (anchor) que genera un error de parseo, el `:` se parsea **silenciosamente** como un dict válido, y el error solo aparece río abajo cuando Pydantic espera un `str` y recibe un `dict`. La cascada es: highlight con `:` → YAML lo parsea como dict → Pydantic rechaza el dict en `list[str]` → error de `NormalEntry` completa. La solución es envolver en comillas dobles cualquier string que contenga `:` seguido de espacio. El agente ejecutó `yaml.safe_load()` para inspeccionar la estructura parseada y vio `{"Applied in QM Validator": "JSON-LD injection..."}` confirmando el diagnóstico.
- **Trigger:** Al generar cualquier contenido YAML con texto libre que pueda contener dos puntos seguidos de espacio (highlights, summaries, details). El cheatsheet de `rules/05-mandatory-validation-protocol.md` documenta este y otros caracteres peligrosos.
