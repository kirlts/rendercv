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

1. **Aislamiento**: Selecciona (cherry-pick) únicamente las experiencias (`experience.md`) y proyectos (`extracurricular.md`) que hacen intersección positiva con lo que busca la oferta.
2. **Educación Intocable**: La sección `Education` SIEMPRE debe incluirse completa desde la `knowledge_base`. No asumas ni recortes la educación (ya viene precargada en el `default_template.yaml`, no la elimines).
3. **Poda de Bullets**: Dentro de las experiencias que SÍ entran, escoge y adapta un **máximo de 3 a 5 detalles clave** que griten "Yo sé hacer esto que están pidiendo", procurando mantener una alta densidad de información para que el CV no quede visualmente vacío.
4. **Estructura Dinámica**: Decide tácticamente qué secciones van primero. Si priorizan el aspecto formativo, `Education` va alto. Si es netamente desarrollo backend, sube los proyectos afines a `Projects`.

## 3. Fase de Anti-Alucinación ("Bullet Linter")

Antes de redactar el output final, asegúrate de pasar tus construcciones lingüísticas por la **Tríada de Sanidad ATS**:

* ¿Usé alguna buzzword vacía? (Ej: "apasionado", "dinámico", "visionario") -> **ELIMINA Y RECHAZA**.
* ¿Escribí alguna obviedad entre paréntesis? -> **ELIMINA Y RECHAZA**.
* ¿Inventé alguna métrica que no estaba explícitamente escrita en la `knowledge_base/`? -> **PÚRGALO O HAZ FALLAR LA EJECUCIÓN**.

Asegura redactar todo con un estilo **SECO, TÉCNICO Y DIRECTO**. Usa la **fórmula**: `[Verbo Fuerte] + [Impacto/Métrica] + [Con qué tecnologías/Stack] + [Resultado final]`.

## 4. Ensamblaje del Output YAML

Tu salida técnica de esta habilidad debe consistir en inyectar las secciones seleccionadas dentro de la estructura general de un archivo RenderCV YAML, utilizando como base el esqueleto definido en `default_template.yaml`.

Asegúrate de:

* Seguir la semántica correcta de arrays y diccionarios del YAML esperado por el motor de diseño.
* Solo generar listas YAML limpias (ej. `- company: ...`) y no inyectar formateos raros.
