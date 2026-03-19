---
name: craft-yaml-cv
description: Destilación inteligente de la knowledge_base para construir un documento YAML compatible con RenderCV, optimizando contra el Job Description y evadiendo detectores ATS.
---

# Habilidad: Sastrería de YAML CV (Craft YAML CV)

Esta skill orquesta la "Fase de Pensamiento" donde contrastas la oferta laboral (Job Description o JD) contra la `knowledge_base/` y generas el código final de un Currículum.

## 1. Fase de Mapeo y Destilación de la Oferta

A partir del "copy-paste" de la oferta provista por el usuario, debes aislar:

* **Cargo y Empresa**: Exactamente cuál es el rol y dónde.
* **Stack Duro**: Lenguajes, herramientas, cloud, plataformas.
* **Soft/Management**: Necesidades de liderazgo, metodologías ágiles, etc.
* **Core Business**: Rubro de la empresa (Fintech, EdTech, B2B SaaS, etc).

## 2. Fase de "Cherry-picking" y Filtrado (The Matchmaker)

Lee iterativamente cada archivo `.md` en la `knowledge_base/`.

1. **Aislamiento Granular**: Selecciona (cherry-pick) únicamente las experiencias y proyectos que hagan intersección positiva con la oferta, analizando sus `- **Technical Stack**:`. Para construir los highlights, usa PRIMERO los `- **Condensed Bullets**:` si existen. Solo recurre a `- **Details**:` como fallback, y en ese caso aplica la regla de Condensación Obligatoria (Art. 6 de `rules/02-cv-sartorial-crafting.md`).
2. **Educación Intocable**: La sección `Education` SIEMPRE debe incluirse completa desde la `knowledge_base`. No asumas ni recortes la educación (ya viene precargada en el `default_template.yaml`, no la elimines).
3. **Poda de Bullets**: La cantidad de highlights por entry la dicta el template. Si un entry tiene N slots vacíos `""`, genera exactamente N highlights. Si el entry es completamente vacío (sin slots definidos), genera highlights hasta alcanzar la densidad óptima para **1 página** sin desbordamiento. Procura enlazar firmemente tus recortes descritos en "Details" con las tecnologías específicas extraídas del sub-campo "Technical Stack". No llenes de viñetas, mantén alta densidad de información.
4. **Auditoría Cruzada Anti-Solapamiento**: Antes de finalizar la selección, compara las entries candidatas de `Experiencia` contra las de `Proyectos Personales`. Si un proyecto ya está cubierto sustancialmente por una experiencia laboral, descártalo de `Proyectos Personales` según el Artículo 5 de `rules/02-cv-sartorial-crafting.md`.
5. **Estructura Dinámica**: Decide tácticamente qué secciones van primero. Si priorizan el aspecto formativo, `Education` va alto. Si es netamente desarrollo backend, sube los proyectos afines a `Projects`.

## 3. Fase de Anti-Alucinación ("Bullet Linter")

Antes de redactar el output final, asegúrate de pasar tus construcciones lingüísticas por la **Tríada de Sanidad ATS**:

* ¿Usé alguna buzzword vacía? (Ej: "apasionado", "dinámico", "visionario") -> **ELIMINA Y RECHAZA**.
* ¿Escribí alguna obviedad entre paréntesis? -> **ELIMINA Y RECHAZA**.
* ¿Inventé alguna métrica que no estaba explícitamente escrita en la `knowledge_base/`? -> **PÚRGALO O HAZ FALLAR LA EJECUCIÓN**.

Asegura redactar todo con un estilo **SECO, TÉCNICO Y DIRECTO**.

**REGLA VERBAL BILINGÜE**: La regla verbal depende del `locale.language` del template:

* **Si `locale: spanish`**: NUNCA uses verbos conjugados en tercera persona (ej. "Desarrolló", "Lideró"). Debes usar obligatoriamente **Sustantivos Verbales / Nominalización** (ej. "Desarrollo de...", "Liderazgo de...", "Implementación de...").
* **Si `locale: english`**: Debes usar obligatoriamente **past-tense action verbs** sin sujeto explícito (ej. "Developed X", "Implemented Y", "Deployed Z"). PROHIBIDO: gerundios ("Implementing..."), voz pasiva ("Was responsible for..."), nominalización ("Development of..."), primera persona ("I developed...").

Usa la **fórmula**:

* **ES**: `[Sustantivo Verbal Fuerte] + [Impacto/Métrica] + [Con qué tecnologías/Stack] + [Resultado final]`.
* **EN**: `[Past-Tense Action Verb] + [Impact/Metric] + [With what technologies/Stack] + [End result]`.

**REGLA DE ORDEN DE BULLETS**: Dentro de cada entry, los highlights se ordenan por impacto arquitectónico descendente, no por "espectacularidad" superficial. El bullet que describe la contribución principal o de mayor alcance va primero. Pipelines de datos, migraciones de infraestructura y decisiones de arquitectura prevalecen sobre endpoints individuales o features puntuales.

**REGLA DE KEYWORDS DE INDUSTRIA**: Al redactar los highlights, el agente debe mapear conceptos de la KB hacia terminología estándar de la industria cuando exista un término más reconocido. Ejemplos:

* "esquemas estrictos de extracción de entidades" → "Structured Output"
* "destilación estructural mediante metodologías NLP" → "NLP (spaCy, embeddings)"
* "validaciones vectoriales aplicando distancias" → "embeddings"

El objetivo es que el ATS indexe keywords que un reclutador buscaría.

## 4. Ensamblaje y Output del YAML (CRÍTICO)

**REGLA CARDINAL**: NUNCA construyas un YAML desde cero. SIEMPRE parte leyendo `/home/kirlts/rendercv/default_template.yaml` y úsalo como base. El template puede llegar **parcialmente rellenado** por el usuario desde el frontend. Antes de escribir cualquier contenido, ejecuta el protocolo de clasificación definido en `rules/03-gap-fill-protocol.md` para determinar qué campos son VACÍOS, FIJADOS, PARCIALES o INSTRUIDOS. El template ya contiene hardcodeados:

* **Nombre completo**: Martín Gil Oyarzún
* **Headline por defecto**: "AI Solutions Architect | Full-Stack Developer" — **INMUTABLE**. No se modifica bajo ninguna circunstancia a menos que el usuario lo solicite explícitamente en el mismo mensaje.
* **Datos de contacto**: teléfono, email, LinkedIn, GitHub
* **Educación**: UNAB + UDP (sección marcada como INTOCABLE)
* **Locale**: `spanish` (fechas, meses y footer en español)
* **Bloque `design`**: tema `jpmr` con `header.connections` y footer personalizado
* **Bloque `settings`**: con placeholders para `output_folder`

**IMPORTANTE**: El YAML se redacta en el **idioma indicado por `locale.language` del template cargado**. Si el template es `default_template.yaml` (locale: spanish), todo va en español. Si es `default_template_english.yaml` (locale: english), todo va en inglés. Los nombres de las secciones los define el template. No inventes secciones que no existan en el template, y no elimines secciones que sí aparezcan. Si el usuario renombra o agrega una sección (ej. `Publicaciones`, `Certificaciones`), adáptate sin cuestionar.

**REGLA DE FALLBACK DE BULLETS**:

* **Si `locale: spanish`**: Usar `Condensed Bullets` como fuente primaria, `Details` como fallback.
* **Si `locale: english`**: Usar `Condensed Bullets EN` como fuente primaria. Si no existen para un entry, traducir los `Condensed Bullets` (español) aplicando la regla verbal EN. Los `Details` siguen siendo fallback de último recurso.

Tu trabajo consiste en **copiar el template** al archivo de destino y **rellenar los gaps** siguiendo el protocolo de `rules/03-gap-fill-protocol.md`:

1. `headline` → **NUNCA modificar**. El headline es una decisión del usuario, no del agente. Solo cambiarlo ante instrucción explícita del usuario.
2. **Todas las secciones bajo `sections:`** → Iterar CADA sección que exista en el template. Para cada una, aplicar el protocolo gap-fill (VACÍO/FIJADO/PARCIAL/INSTRUIDO). Si una sección no existe en el template, **NO la crees**. La estructura de secciones la decide el usuario, no el agente.
3. `output_folder` → reemplazar los placeholders `PLACEHOLDER_CARGO` y `PLACEHOLDER_EMPRESA`. **El cargo NUNCA debe incluir nivel de experiencia** (Senior, Junior, Lead, Staff, Principal, Mid-Level, Entry-Level, Intern, Trainee, Associate). Solo el rol funcional (ej. "GenAI Engineer", no "Senior GenAI Engineer").

**REGLA DE IDIOMA**: Los campos `position` se escriben en el idioma del template. En español, usar equivalentes naturales cuando existan (ej. "Lead Developer" → "Desarrollador Principal"). Términos adoptados por la industria (ej. "Full-Stack", "Machine Learning", "DevOps") se mantienen tal cual. En inglés, usar los títulos estándar del mercado anglófono.

**REGLA DE HIPERVÍNCULO EN PROYECTOS**: Si un proyecto en la `knowledge_base/extracurricular.md` tiene un campo `- **URL**: ...`, el campo `name` del YAML DEBE ser un hipervínculo markdown. Formato: `[Nombre del Proyecto](https://url)`. Si el proyecto no tiene URL en la KB, el `name` es texto plano.

**REGLA DE SUBTÍTULO EN PROYECTOS**: Si un proyecto en la `knowledge_base/extracurricular.md` tiene un campo `- **Subtitle**: ...`, ese texto DEBE mapearse al campo `detail` del YAML. El `detail` aparece como subtítulo junto al nombre del proyecto en el tema `jpmr`.

**REGLA DE TIPO DE EMPLEO**: Si el KB indica que una experiencia es práctica profesional (ej. "en Práctica"), el campo `position` en el YAML DEBE reflejar esa distinción (ej. "Ingeniero de DevOps, Práctica Profesional"). NUNCA presentar una práctica como empleo formal.

**REGLAS ESTRICTAS DE PERSISTENCIA Y RENDERIZADO:**

1. **Guardado del YAML**: El archivo YAML resultante **SIEMPRE** se persiste bajo el directorio `ofertas/` en la raíz del proyecto.
   * **Nomenclatura Obligatoria**: `cargo_empresa_HH-MM_DD-MMM-YY.yaml` (Ej: `ofertas/qa_automation_azumo_13-10_17-Mar-26.yaml`). Nunca lo guardes en la raíz.
2. **Generación Sin Renderizado Automático**: Tu tarea finaliza al escribir y guardar el YAML en el disco. **NO EJECUTES** comandos de terminal para renderizar el archivo (como `uv run rendercv...`). En su lugar, indícale al usuario que ejecute `npm run dev` para previsualizar los resultados en vivo.
3. **Enrutamiento Interno (RenderCommand)**: Ajusta dinámicamente el `output_folder` del bloque `settings` con el Cargo (sin nivel de experiencia) y Empresa reales.
   * Únicamente generar listas limpias, sin formateos anómalos ni aserciones alucinadas.

Ejemplo del bloque de settings final (español):

```yaml
settings:
  render_command:
    output_folder: "../CVs/QA Automation - Azumo/"
    pdf_path: OUTPUT_FOLDER/Martin_Gil_CV_Español.pdf
    dont_generate_html: true
    dont_generate_markdown: true
    dont_generate_png: true
```

Ejemplo del bloque de settings final (inglés):

```yaml
settings:
  render_command:
    output_folder: "../CVs/QA Automation - Azumo/"
    pdf_path: OUTPUT_FOLDER/Martin_Gil_CV_English.pdf
    dont_generate_html: true
    dont_generate_markdown: true
    dont_generate_png: true
```
