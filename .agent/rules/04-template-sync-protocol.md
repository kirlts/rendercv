---
trigger: on_cv_generation
---

# Protocolo de Sincronización de Templates (Template Sync Protocol)

Este protocolo se ejecuta **automáticamente antes de cada generación de CV** para garantizar que ambas plantillas base (`default_template.yaml` y `default_template_english.yaml`) están sincronizadas estructuralmente.

## ARTÍCULO 1: DETECCIÓN DE DESINCRONIZACIÓN

Antes de cargar cualquier template, el agente DEBE comparar ambos archivos y verificar paridad en:

1. **Mismas secciones equivalentes** bajo `sections:` (nombres difieren por idioma):
   - `Experiencia` ↔ `Experience`
   - `Proyectos Personales` ↔ `Personal Projects`
   - `Habilidades` ↔ `Skills`
   - `Educación` ↔ `Education`
2. **Misma cantidad de entries** por sección equivalente.
3. **Misma cantidad de highlights** por entry equivalente.
4. **Mismo `headline`** (siempre en inglés en ambos templates).
5. **Mismos datos de contacto**: nombre, teléfono, email, redes.
6. **Misma estructura de `settings`** (excepto `pdf_path`, que difiere por idioma).

## ARTÍCULO 2: REGLA DE RESOLUCIÓN (MTIME WINS)

Si se detecta una discrepancia:

1. Comparar la fecha de última modificación (`mtime`) de ambos archivos.
2. **El template modificado más recientemente es la fuente de verdad**.
3. Propagar los cambios estructurales del template reciente al template desactualizado:
   - Agregar/eliminar secciones faltantes (traduciendo el nombre al idioma del template destino).
   - Ajustar cantidad de entries y highlights para que coincidan.
   - Traducir contenido FIJADO al idioma destino usando la regla verbal correspondiente (nominalización ES, action verbs EN).
   - Preservar `locale.language` y `pdf_path` nativos de cada template.
4. **Escribir los cambios** al template desactualizado en disco antes de proceder.

## ARTÍCULO 3: INFORME OBLIGATORIO

Si se ejecutó una propagación, informar al usuario antes de generar el CV:

- Qué template estaba desactualizado.
- Qué cambios se propagaron (secciones añadidas/eliminadas, entries ajustados).
- Confirmar que ambos templates están ahora sincronizados.

## ARTÍCULO 4: MAPA DE EQUIVALENCIAS

El siguiente mapa es la referencia canónica para traducir nombres de secciones entre idiomas. Si el usuario agrega secciones nuevas con nombres no listados aquí, el agente debe inferir la traducción o preguntar al usuario.

| Español | English |
| --- | --- |
| `Experiencia` | `Experience` |
| `Proyectos Personales` | `Personal Projects` |
| `Habilidades` | `Skills` |
| `Educación` | `Education` |
| `Publicaciones` | `Publications` |
| `Certificaciones` | `Certifications` |
