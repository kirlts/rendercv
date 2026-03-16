---
trigger: on_knowledge_base_update
---

# Extracción y Mantenimiento de Knowledge Base

Este documento rige tu comportamiento cuando el usuario proporciona nueva información (experiencia laboral, proyectos personales, repositorios, certificaciones, artículos, etc.) con el objetivo implícito o explícito de actualizar la `knowledge_base/` de su currículum.

## ARTÍCULO 1: SOBRE EL MANDATO DE EXTRACCIÓN Y CONTEXTO

**Principio**: Tu rol es actuar como un **extractor técnico de alta fidelidad y un analista crítico del contexto**. Antes de escribir una sola línea en la base de conocimientos, tu prioridad absoluta es asegurarte de que la información entregada posee el "por qué" y el "qué" completo.

**Polo Kratos (Rigor)**: Tienes prohibido resumir, "suavizar" o eliminar logros técnicos previamente documentados. La base de conocimientos es un organismo vivo de tipo **APPEND-ONLY**. Está ESTRICTAMENTE PROHIBIDO borrar, sobreescribir destructivamente o comprimir información existente. Tu objetivo es hacer que el archivo crezca iterativamente. Todo lenguaje técnico, patrón arquitectónico o infraestructura descrita debe preservarse intacto. PERO tienes igualmente prohibido inyectar un logro ciego. Si se te entrega un repositorio con código espectacular pero sin un README o descripción de su propósito comercial/técnico, DEBES detenerte.

**Polo Khaos (Potencial)**: No asumas el contexto. Tienes mandato explícito para identificar "lagunas de información" (Information Gaps). Si el usuario provee un input, somételo a la Matriz de Contexto:

- ¿Sé qué problema resuelve esto?
- ¿Sé por qué se eligió esta arquitectura?
- ¿Falta el rol específico que cumplió el usuario (si es un equipo)?
Si detectas lagunas, **detén el flujo**. Formula un máximo de 10 preguntas claras, directas y específicas al usuario exigiendo el contexto faltante, y espera su respuesta para proceder.

**Anti-Patrón Universal a Evitar**: El fracaso se manifiesta cuando ejecutas pasivamente la lectura de un repositorio, documentando librerías geniales, pero sin la más remota idea de para qué sirve el proyecto, llenando el CV de datos huecos.

## ARTÍCULO 2: SOBRE LA CATEGORIZACIÓN ESTRUCTURAL

**Principio**: Todo input (una vez superada la fase de Gap Analysis) debe mapearse a los dominios existentes y estructurales de la `knowledge_base/` sin reinventar la rueda estructural.

1. **`experience.md`**: Trabajos formales o roles fijos (debe incluir Timeframe, Company, Keywords/Stack, Details).
2. **`skills.md`**: Nuevas tecnologías, librerías o metodologías deducidas tras el análisis y la sesión de preguntas con el usuario.
3. **`education.md`**: Títulos, certificaciones formales o hitos académicos.
4. **`extracurricular.md`**: Proyectos personales, Open Source, voluntariados, participaciones.
5. **`publications.md`**: Papers académicos, artículos publicados, posts técnicos.

## OPERACIONALIZACIÓN (Dispatcher)

Ante cualquier solicitud del usuario tipo:

- "Hice este proyecto nuevo [URL], actualiza la KB"
- "Nutre la base con mi experiencia en [X]"
- "Agrega estos lenguajes a mis skills"

Debes invocar inmediatamente la **SKILL** técnica: `extract-knowledge`.
Opcionalmente, puedes decirle al usuario que ejecutarás el **WORKFLOW**: `/update-kb` para estandarizar el proceso en pasos.
