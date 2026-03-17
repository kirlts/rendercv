---
description: /tailor-cv [texto de oferta laboral] - Analiza la oferta, filtra la knowledge base y renderiza un PDF específico a medida.
---

# Flujo de Empaquetado Curricular (Tailor CV)

Este flujo se detona cuando el usuario provee el texto crudo de una Job Description (JD) o solicita derechamente un currículum para una empresa.

## Paso 1: Lectura de Oferta y Análisis Inverso

Absorbe todo el texto de la oferta provista, identificando:

- **Cargo y Empresa** (o "Título de Postulación" si la empresa es incógnita).
- Extrae la esencia de lo que requiere la posición empleando tu criterio.

## Paso 2: Lectura Ciega del Default Template y la Knowledge Base

En memoria, lista y absorbe la información estructural proveniente de:

- `/home/kirlts/rendercv/default_template.yaml` (Base con la info estática).
- Proveer lectura completa a las entradas de `/home/kirlts/rendercv/knowledge_base/*.md`.

## Paso 3: Invocación de la Skill de Sastrería (Filtro)

Ejecuta la habilidad `.agent/skills/craft-yaml-cv/SKILL.md`. Con ella destila la data, ignorando la información paja y adoptando el Sigilo Sintáctico (Anti-AI Tells) de las `rules/02-cv-sartorial-crafting.md`.

## Paso 4: Generación de Archivo YAML

Escribe, sin intervención, un nuevo archivo YAML que contendrá el documento completo a compilar.
Las pautas de ruta de destino son:

1. Crea el directorio si no existe: `rendercv/ofertas/`
2. Nombre del archivo: `[Cargo] - [Empresa] HH-MM_DD-MMM-YYYY.yaml` (ej. `Frontend_Lead-Google_14-30_16-Mar-2026.yaml`). Reemplaza espacios con guiones bajos o camelCase estructurado.

## Paso 5: Renderizado y Entrega (Orquestación Bash)

Una vez el archivo YAML exista localmente, debes orquestar su renderización mediante bash:

1. Ejecuta el renderizado de RenderCV:

   ```bash
   rendercv render "ofertas/[nombre_del_archivo].yaml"
   ```

2. Mueve y renombra el PDF resultante (que normalmente se deposita en una carpeta `rendercv_output/`) apuntando a:

   ```bash
   mkdir -p "CVs/[Cargo] - [Empresa] HH-MM_DD-MMM-YYYY/"
   mv "rendercv_output/[nombre_del_archivo].pdf" "CVs/[Cargo] - [Empresa] HH-MM_DD-MMM-YYYY/Martin_Gil_CV_Español.pdf"
   ```

3. Comunícale al usuario la ruta del PDF finalizado e infórmale de forma concisa sobre tres aspectos de la sastrería empleada: qué incluyó, qué dejó afuera y qué keywords acentúo para burlar al ATS.

## Paso 6: Ciclo Iterativo (Feedback Loop)

Asume que el CV requiere correcciones visuales o de impacto. Ante cualquier indicación del usuario (ej "Quita el proyecto X y pon Y", "Ajusta los márgenes porque quedó en 2 páginas"):

1. Realiza las modificaciones estructurales o de código directamente en el `.yaml` generado.
2. Vuelve a correr silenciosamente el proceso de renderizado (`rendercv render...` y `mv...`).
3. Entrega el aviso de actualización. Repite cuantas veces instruya el usuario.
