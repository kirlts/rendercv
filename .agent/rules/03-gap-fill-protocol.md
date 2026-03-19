---
trigger: on_cv_generation
---

# Protocolo de Relleno de Gaps (Gap-Fill Protocol)

Este documento define cómo interpretar y completar un `default_template.yaml` que puede llegar parcialmente rellenado por el usuario.

## ARTÍCULO 1: ESCANEO Y CLASIFICACIÓN

Al leer el `default_template.yaml`, clasifica CADA campo editable en:

1. **VACÍO**: Arrays vacíos `[]` o campos string vacíos `""`.
   → Libertad total para rellenar desde la `knowledge_base/`.
2. **FIJADO**: Cualquier campo con contenido textual no vacío y sin corchetes.
   → INTOCABLE. Preservar literalmente, carácter por carácter. No parafrasear, no reordenar, no eliminar.
3. **PARCIAL**: Un array donde ALGUNOS elementos tienen contenido y otros son strings vacíos `""`.
   → Rellenar SOLO los strings vacíos. Los elementos con contenido son FIJADOS.
4. **INSTRUIDO**: Un string que contiene texto entre corchetes `[...]`.
   → Interpretar como instrucción del usuario. Generar contenido que cumpla la instrucción usando datos de la `knowledge_base/`, y reemplazar el string completo (incluyendo corchetes) con el resultado.

## ARTÍCULO 2: REGLA DE INMUTABILIDAD DEL CONTENIDO FIJADO

Tienes PROHIBIDO:

- Parafrasear, reformular o "mejorar" texto FIJADO por el usuario.
- Eliminar o reordenar entries FIJADAS.
- Mover un highlight FIJADO de posición dentro de su lista.
- **Eliminar elementos de una lista FIJADA o PARCIAL.** Si la lista tiene N elementos, el output tiene N elementos. Sin excepción.

El contenido FIJADO es sagrado. Si un highlight FIJADO tiene errores ortográficos, déjalo tal cual. La corrección ortográfica NO es tu mandato.

**Excepción de Recomendación**: Aunque el agente no puede MODIFICAR contenido FIJADO, SÍ puede RECOMENDAR mejoras al usuario en el informe de entrega, **siempre en función de la oferta laboral específica**. Ejemplo: "Para esta oferta de AI Specialist, el summary de Educación podría beneficiarse de mencionar pgvector y RAG como keywords". Esta recomendación va SOLO en el mensaje al usuario, NUNCA en el YAML.

## ARTÍCULO 3: RELLENADO DE SLOTS VACÍOS

Para slots VACÍOS O PARCIALES, aplica las mismas reglas de cherry-picking, anti-alucinación y sigilo sintáctico de la skill `craft-yaml-cv` y la regla `02-cv-sartorial-crafting.md`. Específicamente:

- Un slot vacío de highlights se rellena con contenido de la KB que haga intersección positiva con la oferta laboral.
- Un slot vacío de sección completa (ej. `Experiencia: []`) se rellena como si el template estuviera completamente vacío para esa sección.

## ARTÍCULO 4: INTERPRETACIÓN DE INSTRUCCIONES `[...]`

Cuando un highlight contiene texto entre corchetes:

1. Extrae la instrucción textual dentro de los corchetes.
2. Busca en la `knowledge_base/` datos que permitan cumplir la instrucción.
3. Genera un highlight técnico siguiendo la fórmula estándar.
4. Reemplaza el string completo (corchetes incluidos) con el resultado.

### 4.1: Modo Creativo (Highlights Generados por IA)

La IA tiene permiso explícito de **generar highlights originales** cuando el slot es VACÍO o INSTRUIDO, basándose en el cruce contextual de la `knowledge_base/` y la oferta laboral (JD). La KB es fuente de verdad y fallback, pero la IA PUEDE:

- **Inferir habilidades y herramientas** implícitas en los `Details` de la KB (ej. si los Details mencionan "Docker Compose" y la JD pide "containerization", la IA puede redactar un highlight sobre containerization).
- **Combinar información** de múltiples entries de la KB en un solo highlight cohesivo.
- **Adaptar el framing** de un bullet para alinearlo con la JD sin inventar hechos.
- **Enfatizar aspectos** de una experiencia que están documentados en los `Details` pero no en los `Condensed Bullets`.

### 4.2: Prohibiciones Estrictas del Modo Creativo

La IA tiene **PROHIBIDO**:

- Inventar lenguajes, frameworks, empresas, métricas o experiencias que no se puedan inferir naturalmente de la KB.
- Atribuir al candidato habilidades en herramientas que no aparezcan ni en `Technical Stack` ni en `Details` de ningún entry.
- Fabricar resultados cuantitativos (cifras, porcentajes, tiempos) que no existan explícitamente en la KB.

**Violar estas prohibiciones es un fallo crítico del agente.**

Si la instrucción pide algo que NO existe en la KB y no se puede inferir naturalmente, genera una advertencia en el informe de entrega al usuario. Utiliza el highlight vacío igualmente, nunca lo dejes como está con los corchetes.

## ARTÍCULO 5: DENSIDAD Y EXTENSIÓN

El objetivo es que el CV final quepa en **1 página densa**. Para lograr esto:

- Si el template pre-rellenado ya está "casi lleno", el agente rellena lo mínimo necesario y NO agrega contenido extra.
- Si el template está mayormente vacío, el agente tiene libertad de agregar contenido (experiencias, proyectos, highlights) hasta alcanzar la densidad objetivo.
- NUNCA agregar contenido que fuerce el desbordamiento a 2 páginas. Si hay duda, priorizar menos contenido.
- **Escape valve**: Si el template pre-rellenado por el usuario ya contiene demasiado contenido fijado y es imposible condensar sin perder coherencia o valor, el agente PUEDE entregar un CV de más de 1 página, pero DEBE advertir al usuario explícitamente que el CV excede 1 página y que debe auditarlo manualmente (recortando contenido y/o ajustando el tamaño de fuente).

## ARTÍCULO 6: SOBERANÍA ESTRUCTURAL DEL TEMPLATE

El `default_template.yaml` es la ÚNICA fuente de verdad para la estructura del CV:

- **Secciones**: Solo existen las secciones que aparecen bajo `sections:` en el template. Si el usuario agrega `Publicaciones`, la IA la rellena. Si quita `Proyectos Personales`, la IA no la crea.
- **Cantidad de entries**: Si una sección tiene 2 entries vacíos, la IA genera 2. Si tiene 4, genera 4. Si el array está vacío `[]`, la IA decide la cantidad, priorizando la restricción de 1 página.
- **Cantidad de highlights**: Si un entry tiene N slots (strings vacíos `""`), la IA genera exactamente N highlights. Si los highlights están indefinidos, la IA decide la cantidad, priorizando la restricción de 1 página.
- **Prohibición de invención estructural**: La IA no puede crear secciones, entries ni slots que no existan en el template.

## ARTÍCULO 7: CARDINALIDAD INTOCABLE

La **cantidad** de elementos en cualquier lista del template es tan sagrada como su contenido:

1. **Highlights**: Si un entry tiene 3 highlights (FIJADOS, vacíos o mixtos), el output tiene exactamente 3. La IA NO puede eliminar un highlight FIJADO porque "no es relevante para la oferta". La relevancia la decide el usuario al fijar el contenido.
2. **Entries**: Si una sección tiene 3 entries, el output tiene 3 entries. Si tiene 2, tiene 2.
3. **Secciones**: Si el template tiene 4 secciones, el output tiene 4 secciones.
4. **Habilidades**: Si hay 4 labels de habilidades, el output tiene 4 labels.

**Caso de uso**: El usuario fija 3 highlights en UNAB. Uno de ellos menciona JSON-LD, que podría no coincidir con la oferta. La IA DEBE preservarlo íntegramente. Si el usuario quisiera eliminarlo, lo haría él mismo en el template.

**Violación de esta regla = fallo crítico del agente.**
