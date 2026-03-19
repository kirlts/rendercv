---
description: /tailor-cv [texto de oferta laboral] - Analiza la oferta, filtra la knowledge base y renderiza un PDF específico a medida.
---

# Flujo de Empaquetado Curricular (Tailor CV)

Este flujo se detona cuando el usuario provee el texto crudo de una Job Description (JD) o solicita derechamente un currículum para una empresa.

## Paso 1: Lectura de Oferta y Análisis Inverso

Absorbe todo el texto de la oferta provista, identificando:

- **Cargo y Empresa** (o "Título de Postulación" si la empresa es incógnita).
- **REGLA DE CARGO SIN NIVEL DE EXPERIENCIA:** Al extraer el cargo de la JD, NUNCA incluir calificadores de nivel de experiencia (Senior, Junior, Lead, Staff, Principal, Mid-Level, Entry-Level, Intern, Trainee, Associate). El cargo debe ser únicamente el rol funcional. Ejemplos: "Senior GenAI Engineer" → "GenAI Engineer". "Junior DevOps Engineer" → "DevOps Engineer". "Lead Platform Engineer" → "Platform Engineer".
- Extrae la esencia de lo que requiere la posición empleando tu criterio.

## Paso 1.5: Detección de Idioma

Determina el idioma objetivo del CV:

1. Si el usuario dice explícitamente "en inglés" / "in English" → **inglés**.
2. Si la JD está escrita íntegramente en inglés → **inglés**.
3. Default: **español**.

El idioma detectado determina qué template base se carga en el Paso 2.

## Paso 2: Lectura del Default Template y la Knowledge Base

Lee y carga en memoria:

- **Template base según idioma**: Si el idioma es español → `/home/kirlts/rendercv/default_template.yaml`. Si es inglés → `/home/kirlts/rendercv/default_template_english.yaml`. **Antes de cargar**, ejecuta el protocolo de sincronización de `rules/04-template-sync-protocol.md` para verificar que ambos templates están alineados estructuralmente.
- Todos los archivos `.md` en `/home/kirlts/rendercv/knowledge_base/` — fuente de experiencia, proyectos, skills y datos extracurriculares.

## Paso 3: Invocación de la Skill de Sastrería (Filtro)

Ejecuta la habilidad `.agent/skills/craft-yaml-cv/SKILL.md`. Con ella destila la data, ignorando la información paja y adoptando el Sigilo Sintáctico (Anti-AI Tells) de las `rules/02-cv-sartorial-crafting.md`.

## Paso 4: Generación de Archivo YAML (Template → Fill → Save)

Copia el template base (ES o EN según idioma detectado). La estructura de secciones del template es soberana: la IA rellena exactamente las secciones que existan, sin agregar ni quitar ninguna. Escanea y clasifica cada campo según el protocolo de Gap-Fill (`rules/03-gap-fill-protocol.md`): preserva contenido FIJADO, rellena slots VACÍOS y PARCIALES desde la KB, e interpreta instrucciones `[...]` (incluyendo el Modo Creativo del Art. 4.1). Ajusta `output_folder` con el Cargo (sin nivel de experiencia) y Empresa reales. El `headline` NO se modifica. Redacta en el idioma del template.

Las pautas de persistencia son:

1. Crea el directorio si no existe: `rendercv/ofertas/`
2. Nombre del archivo: `cargo_empresa_HH-MM_DD-MMM-YY[_en].yaml` (ej. `ofertas/ai_specialist_acl_13-10_17-Mar-26_en.yaml` para inglés, `ofertas/qa_automation_azumo_13-10_17-Mar-26.yaml` para español). Usa guiones bajos, todo en minúsculas. El sufijo `_en` se agrega solo si el idioma es inglés.

## Paso 4.5: Validación Obligatoria (Gate de Calidad)

Ejecuta el protocolo de `rules/05-mandatory-validation-protocol.md`. El YAML generado **DEBE** pasar validación contra el parser de RenderCV antes de ser entregado al usuario. Si falla, corrige y re-valida en loop hasta que pase. Ejecutar: `.venv/bin/python scripts/validate_yaml.py ofertas/<archivo>.yaml`.

## Paso 5: Generación y Entrega

Una vez el archivo YAML exista localmente en la carpeta `ofertas/`:

1. **NO** ejecutes ningún comando de renderizado. Debes limitarte a guardar el archivo YAML.
2. Indícale al usuario la ruta del archivo YAML finalizado (`/ofertas/archivo...`) e infórmale de forma concisa sobre tres aspectos de la sastrería empleada: qué incluyó, qué dejó afuera y qué keywords acentuó para burlar al ATS.
3. Invita al usuario a levantar el entorno de desarrollo ejecutando `npm run dev` en su propia terminal para previsualizar, renderizar y modificar el currículum recién generado.

## Paso 6: Ciclo Iterativo (Feedback Loop)

Asume que el CV requiere correcciones visuales o de impacto. Ante cualquier indicación del usuario (ej "Quita el proyecto X y pon Y", "Ajusta los márgenes porque quedó en 2 páginas"):

1. Realiza las modificaciones estructurales o de código directamente en el `.yaml` generado.
2. Al guardar el `.yaml`, si el usuario tiene `npm run dev` corriendo, los cambios se reflejarán en vivo.
3. Entrega el aviso de actualización. Repite cuantas veces instruya el usuario.
