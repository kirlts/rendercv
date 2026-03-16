# Projects & Extracurricular Activities

## Prometeo (OSINT & NLP Engine)

- **Timeframe**: 2026 – Actualidad
- **Keywords**: Python, Docker, NLP, spaCy, thefuzz, Google GenAI SDK, APIs, OSINT, Data Mining
- **Details**:
  - Ideación y desarrollo en solitario (Solo-dev) de un prototipo funcional de motor OSINT ("Inversión Lingüística") para la detección de nichos B2B (SaaS) a partir de evidencias orgánicas de frustración online (Shadow IT).
  - Implementación de un pipeline determinista de 4 fases que combina ingesta asíncrona de foros (vía API web), destilación estructural mediante NLP (análisis sintáctico, POS Tagging) y validaciones vectoriales usando distancias matemáticas (Levenshtein y TF-IDF).
  - Orquestación de Modelos de Lenguaje de Gran Escala (LLMs) aplicando "Zero-Shot CoT" en base al nuevo SDK `google.genai` para forzar esquemas estrictos de extracción de entidades.
  - Empaquetamiento de la solución en un entorno aislado con Docker y Python 3.14.
  - Impacto: Ingesta y procesamiento analítico de más de 2000 comentarios raw en Reddit, resultando en la identificación y auditoría de más de 50 oportunidades de desarrollo SaaS en el sector GovTech B2B de Chile.

## Dojo de Karate Itosu-Ryu (Landing Page)

- **Timeframe**: Febrero 2025
- **Keywords**: React 19, Vite, Tailwind CSS v4, Framer Motion, GitHub Actions, GitHub Pages, SEO, Accesibilidad
- **URL**: kirlts.github.io/karate-moreno
- **Details**:
  - Diseño y desarrollo web de extremo a extremo (Frontend) para el dojo del cual soy estudiante, con el objetivo de profesionalizar la imagen de la escuela y lograr conversiones directas vía WhatsApp.
  - Implementación veloz ("Time to Market"): El sitio completo fue codificado, animado y desplegado de forma gratuita en GitHub Pages dentro de un plazo de 24 horas.
  - Adopción de tecnologías "State of the Art" como React 19 y Tailwind CSS v4 nativo con animaciones de Framer Motion, garantizando un rendimiento óptimo y una experiencia visual de grado "Premium".
  - Integración de buenas prácticas SEO (Microdatos JSON-LD, OG Tags) y Accesibilidad (A11y), y sistematización de un pipeline CI/CD empleando GitHub Actions para linting y despliegue automático.

## WIRIN (CAD for AI Agentic Systems)

- **Timeframe**: Enero 2026 – Actualidad
- **Keywords**: TypeScript, React, Vite, React Flow, Yjs, IndexedDB, Local-First, Neuro-Symbolic Architecture
- **Details**:
  - Ideación, diseño y desarrollo en solitario (Full-Stack) de WIRIN, un entorno CAD de grado profesional diseñado bajo filosofía "Local-First" para arquitectos de IA, permitiendo modelar visualmente sistemas multi-agentes y protocolos (MCP, UTCP).
  - Implementación de un motor vectorial de alto rendimiento (React Flow) estabilizado para sostener 120fps en Chrome (iGPU) durante operaciones de pan/zoom de lienzos complejos.
  - Desarrollo de un "Linter Visual" con validación estática de grafos (Taint Analysis y prevención de ciclos reflexivos) que alerta sobre vulnerabilidades y exfiltración de datos antes de escribir código.
  - Gestión de persistencia descentralizada y sincronización en memoria integrando `Yjs` e `IndexedDB`, garantizando la soberanía de los datos sin depender de bases de datos remotas.
  - Diseño de experiencia de usuario (UX) asíncrona de adopción progresiva, incorporando un "Hover-and-Learn system" educativo de estándares neuro-simbólicos 2026.

## Witral Framework (Open Source Project)

- **Timeframe**: Diciembre 2025 – Actualidad
- **Keywords**: TypeScript, Node.js, Hono, Docker/Containerization, Baileys Lib, Google Drive API, Self-Hosted, Oracle Cloud
- **URL**: github.com/kirlts/witral
- **Details**:
  - Proyecto realizado para resolver una necesidad propia, liberado en modalidad Open Source (licencia MIT). Release v1.0.0.
  - Framework de ingesta modular self-hosted diseñado para la captura y estructuración de flujos de información no estructurada (captura mensajes de WhatsApp/Telegram, los categoriza y guarda ordenados en Drive u otra plataforma).
  - Arquitectura: Sistema desacoplado construido en TypeScript y Node.js sobre Docker. Implementa un patrón de diseño basado en plugins que separa la capa de entrada (Ingestors) de la capa de persistencia (Storage).
  - Interoperabilidad: El release actual incluye un plugin para integración con WhatsApp (vía librería Baileys) y un sistema de almacenamiento agnóstico extensible a servicios Cloud (Google Drive API) y sistemas de archivos locales.
  - Enfoque: Prioriza ejecución determinista y privacidad del usuario, ofreciendo una alternativa a soluciones Cloud para el conocimiento personal, compatible nativamente con Obsidian y otros PKMs.
  - Desarrollo Full-Stack integral en solitario, abarcando desde el diseño de la arquitectura modular del Core Framework (Node.js/TypeScript) hasta la Landing Page estática (Vite, TailwindCSS, Framer Motion).
  - Construcción de una Interfaz de Línea de Comandos (CLI) interactiva mediante Hono y herramientas de terminal.
  - Empaquetado y orquestación de la solución en contenedores Docker, facilitando el despliegue de un bot 24/7 estable en infraestructura Oracle Cloud (Free Tier).

## Marco de Trabajo Kairós (Personal Project / Philosophy)

- **Timeframe**: Agosto 2025 – Actualidad
- **Details**:
  - Kairós es una filosofía de diseño que he desarrollado para abordar la "brecha de intención" en la colaboración humano-IA. En lugar de tratar a los LLMs como asistentes pasivos, este marco los transforma en socios estratégicos y dialécticos. El objetivo es potenciar la sinergia usuario-IA a través de principios de interacción y la imposición de estructura sobre el potencial del LLM.
  - Puede implementarse como una "Constitución como Código" (CaC) que fuerza al agente de IA a deliberar sobre la premisa del problema antes de ejecutar una solución. El objetivo es pasar de la simple generación de contenido a una sinergia medible y de alta calidad.
  - El "Validador QM" es una implementación práctica y directa de este marco, usando JSON-LD como el polo de "estructura" para alinear esta capacidad generativa de la IA con los estrictos requisitos y auditar a la IA.

## Validador QM: Plataforma de Aseguramiento de Calidad con IA (Tesis de Grado)

- **Timeframe**: Marzo 2025 – Diciembre 2025
- **Details**:
  - Este proyecto fue mi Tesis de Grado y la respuesta técnica a un cuello de botella real en la educación superior: el diseño instruccional vive atrapado en formatos documentales estáticos (Word/Excel), opacos al análisis computacional, dificultando enormemente la validación automatizada de la calidad y diseño pedagógicos. Los supervisores dedicaban semanas a revisar esto manualmente.
  - Diseñé y construí una plataforma tecnológica completa que moderniza el aseguramiento de la calidad, hoy en fase de adopción inicial en la UNAB.
  - Definí una especificación formal en JSON-LD que transforma diseños instruccionales no estructurados en modelos de datos computables, haciendo explícitas las relaciones pedagógicas y modelando los estándares Quality Matters de forma adecuada.
  - Desarrollé una arquitectura desacoplada utilizando N8N como motor de orquestación y bases de datos vectoriales (Supabase/pgvector) para habilitar análisis mediante agentes de IA Generativa (RAG).
  - El sistema resultante permite la validación automatizada de estándares Quality Matters (QM) y ofrece asistencia conversacional a los diseñadores. Desplegué la solución en infraestructura productiva.
  - La arquitectura y especificación fueron validadas a través de trabajos aceptados en conferencias internacionales (IFE 2026, EDUNINE 2026).

## ExpoSmart UNAB 2025 - Validador QM

- **Role**: Expositor & Desarrollador Front-end
- **Keywords**: Vue.js 3, Vite, Tailwind CSS, UI/UX Design, Performance Optimization
- **URL**: validadorqm.exposmart.cl/
- **Details**:
  - Presentación de la arquitectura y despliegue productivo del "Validador QM" ante autoridades académicas y el sector industrial.
  - Diseño y desarrollo Front-end exclusivo (Solo-dev) de la Landing Page oficial del proyecto para la feria de innovación ExpoSmart.
  - Creación e implementación del manifiesto de diseño crítico 'Cyber-Rationalism V2.0', enfocado en interfaces de alta densidad con estética industrial (Glassmorphism, mallas topológicas).
  - Arquitectura Front-end construida sobre Vue.js 3 (Composition API) y Tailwind CSS, optimizada estructuralmente para garantizar una renderización sostenida y fluida a 120fps en hardware integrado (iGPU).
