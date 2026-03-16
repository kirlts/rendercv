---
name: extract-knowledge
description: Skill de ejecución para rutear, categorizar y formatear datos no estructurados y repositorios de código hacia la base de conocimientos del CV del usuario.
---

# Habilidad de Extracción de Conocimiento (Knowledge Base)

Esta skill define el **"CÓMO"** debes extraer y dar formato a la nueva información entregada por el usuario para nutrir la `knowledge_base/`.

## 1. Identificación de Lagunas (Gap Analysis)

**Obligatorio antes de cualquier extracción:** Somete el input del usuario (texto o repositorio) a la "Matriz de Completitud Crítica del CV". Examina si la información entregada responde satisfactoriamente a las siguientes preguntas:

- **Propósito**: ¿Para qué sirve esto o qué problema central de negocio/técnico resuelve?
- **Rol Exclusivo**: ¿Qué hizo exactamente el usuario aquí vs qué hizo el framework o el equipo?
- **Impacto/Métrica**: ¿Hay resultados medibles de desempeño o éxito del proyecto?
- **Arquitectura Global**: Entiendo qué librerías tiene, pero ¿entiendo *por qué* se eligió esta arquitectura?

**Si faltan una o más respuestas clave**:

1. DETÉN el proceso de escritura.
2. Agrupa tus dudas.
3. Formula un **máximo de 10 preguntas** clave, numeradas y directas al usuario para rellenar estas lagunas. Emplea la herramienta `notify_user` o devuélvele la palabra si estás en chat normal.
4. Solo procede al paso 2 cuando el usuario haya proveído el contexto.

## 2. Análisis de Contexto (Ingesta)

Dependiendo de lo que el usuario provea y tras sanear sus respuestas en el Gap Analysis, ejecuta:

### Si el usuario provee un Repositorio o Código Fuente

1. **Analiza Dependencias**: Lee manifiestos (`package.json`, `requirements.txt`) para extraer tecnologías.
2. **Analiza Infraestructura**: Identifica el stack de despliegue (`Dockerfile`, CI/CD).
3. **Cruza con el Gap Analysis**: Une las librerías leídas con el "por qué" entregado por el usuario.

### Si el usuario provee Texto / Descripciones

1. Extrae explícitamente el **Cuándo** (Timeframe), el **Qué** (Role/Title) y el **Dónde** (Context/Company).
2. Estructura el impacto de sus acciones (con data cualitativa del Gap Analysis).
3. Mantén la jerga técnica nativa intacta.

## 2. Inserción Modular (Formateo)

Debes escribir en el archivo markdown correspondiente (`knowledge_base/{dominio}.md`) bajo la sección de nivel 2 `## [Título]`. **NO utilices campos rígidos como "Source" o "Date Added".** Sigue esta estructura flexible:

### Para `experience.md` o `extracurricular.md`

```markdown
## [Título del Proyecto / Rol]
- **Company/Context** (Opcional): [Empresa o Contexto]
- **Timeframe**: [Fechas o "Actualidad"]
- **URL** (Opcional): [Link]
- **Keywords**: [Lista separada por comas de TODAS las tecnologías deducidas o explícitas]
- **Details**:
  - [Bullet exhaustivo y específico del problema resuelto]
  - [Bullet exhaustivo y específico de la arquitectura o diseño técnico]
```

### Para `skills.md`

Revisa las categorías actuales bajo `##`. Si la tecnología encaja, agrégala como un string a la lista o crea un sub-bullet si es una rama específica.

```markdown
## [Categoría, ej: Arquitectura de Sistemas & DevOps]
- **[Subcategoría, ej: Cloud]**: Agrega aquí las nuevas, preservando las existentes.
```

## 3. Mandato de Salida y Crecimiento (Append-Only)

1. **La regla de oro**: La base de conocimientos debe **crecer infinitamente**. NUNCA borres, resumas excesivamente ni comprimas la información de un proyecto previo para "ahorrar espacio".
2. Inserta la nueva información agregando nuevos bloques (Append) o enriqueciendo bloques existentes (Enrich). Si vas a modificar una experiencia existente porque el usuario hizo algo nuevo en ella, AGREGAS nuevos bullets a `Details`, no reemplazas los viejos.
3. NO SOBREESCRIBAS DE FORMA DESTRUCTIVA la información vieja del archivo bajo ninguna circunstancia.
4. Al terminar, la sintaxis debe estar lista para pasar `npx markdownlint-cli`. Abstente de crear saltos de lina dobles entre los bullets o violar el estándar MD032 y MD022.
