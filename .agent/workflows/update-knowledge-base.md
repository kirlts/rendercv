---
description: /update-kb - Ingresa, categoriza, aplica formato y verifica en linter nueva información a la base de conocimientos.
---

# Flujo de Actualización de Base de Conocimientos

Este workflow debe activarse de forma proactiva cada vez que el usuario te entregue información cruda que deba ser inyectada y formateada para el currículum.

## Paso 1: Confirmación de Input

Analizar qué tipo de información ha entregado el usuario:

- URL de Repositorio (requiere hacer pull o usar herramientas de lectura local)
- Archivos locales o PDFs
- Texto crudo de descripción

## Paso 2: Gap Analysis y Clarificación (OBLIGATORIO)

Invoca la cognición de `.agent/skills/extract-knowledge/SKILL.md` (Paso 1).

- Lee la data cruda del usuario.
- Busca identificar el *Propósito*, el *Rol*, el *Impacto* y el *Porqué Arquitectónico*.
- **Si hay lagunas**: Suspende la ejecución del workflow. Interroga al usuario haciendo hasta **10 preguntas máximas** mediante la interfaz. Quédate a la espera de sus respuestas.
- **Si NO hay lagunas (o una vez contestadas)**: Procede al siguiente paso.

## Paso 3: Invocación de Skill (Extracción)

Basado en el contexto nutrido, define a qué archivos de `knowledge_base/*.md` irá la información. Transforma el input en un bloque listo para inserción.

## Paso 3: Planificación, Inyección y Enriquecimiento

Procede a inyectar directamente la información estructurada en los respectivos archivos `.md` de `knowledge_base/`.

1. **Ley Append-Only (Cero Destrucción)**: La Knowledge Base solo crece. JAMÁS elimines un bloque antiguo, ni comprimas bullets existentes.
2. **Nuevos Items**: Añade los nuevos bloques `## [Titulo]` sin romper los anteriores.
3. **Roles Existentes**: Si la nueva información nutre un rol que ya está en el CV, simplemente agrega nuevos bullets debajo de `Details` o nuevas `Keywords`. JAMÁS elimines lo anterior para "hacer espacio".
4. **Estructura Flexible**: Usa la estructura mínima descrita en la Skill (Role/Timeframe/Keywords/Details).

## Paso 4: Linting Obligatorio

Una vez inyectados los datos en todos los archivos pertinentes, DEBES correr el siguiente comando para garantizar que la estructura Markdown es perfecta:

```bash
npx markdownlint-cli "knowledge_base/*.md" --fix
```

Si el comando lanza errores no reparables automáticamente, arréglalos editando los archivos problemáticos, como espacios adicionales u omisión de saltos de línea ante `##`.

## Paso 5: Feedback al Usuario

Informa de forma concisa (como un consultor senior):

1. Qué archivos se actualizaron (ej. `experience.md` y `skills.md`).
2. Qué nuevas tecnologías se catalogaron en "Keywords" o en sus grupos respectivos.
3. Confirmación de paso del lint de Markdown.
