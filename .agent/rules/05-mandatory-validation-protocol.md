---
trigger: on_cv_generation
---

# Protocolo de Validación Obligatoria (Mandatory Validation Protocol)

Este protocolo se ejecuta **automáticamente después de cada generación de YAML de CV** y antes de entregarlo al usuario.

## ARTÍCULO 1: VALIDACIÓN CONTRA EL PARSER DE RENDERCV

Después de escribir el archivo YAML en disco, el agente **DEBE** validarlo contra el parser real de RenderCV antes de notificar al usuario. El método de validación es:

```bash
.venv/bin/python scripts/validate_yaml.py ofertas/<archivo>.yaml
```

Este script llama directamente a `build_rendercv_dictionary_and_model()` (la misma función que usa el API del frontend). **No requiere que `npm run dev` esté corriendo.**

**Criterio de aceptación**: Exit code 0 + mensaje `✅ VALIDATION PASSED` = válido. Exit code 1 = error.

**Si la validación falla**, el agente DEBE:

1. Leer los errores impresos por el script para diagnosticar el problema.
2. Corregir el YAML en disco.
3. Re-ejecutar la validación.
4. Repetir hasta que pase (exit code 0).

**Está PROHIBIDO entregar un YAML al usuario sin haber obtenido exit 0 del validador.**

## ARTÍCULO 2: ERRORES COMUNES DE YAML (CHEATSHEET)

Los siguientes patrones son causas frecuentes de errores de validación que el agente debe evitar proactivamente:

| Error | Causa | Solución |
| --- | --- | --- |
| Colon en string no citado | `- Applied in QM Validator: algo` → YAML lo parsea como `{Applied in QM Validator: algo}` (dict) | Envolver en comillas: `- "Applied in QM Validator: algo"` |
| Ampersand `&` no citado | `label: AI & ML` → YAML lo interpreta como anchor | Envolver en comillas: `label: "AI & ML"` |
| Caracteres especiales sin escapar | `#`, `!`, `@`, `%`, `*`, `{`, `}`, `[`, `]` al inicio de un string | Envolver en comillas |
| Indentación inconsistente | Mezclar tabs y espacios, o cambiar nivel de indentación | Usar siempre espacios, mantener indentación consistente |

## ARTÍCULO 3: REGLA DE CITADO PREVENTIVO

Al generar cualquier string YAML que contenga **alguno** de estos caracteres: `: & # ! @ % * { } [ ]`, el agente DEBE envolverlo en comillas dobles automáticamente, sin esperar a que el validador lo rechace.

**Esto aplica a**: highlights, labels, details, summaries, positions, y cualquier otro campo de texto libre.
