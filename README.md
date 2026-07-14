<div align="center">
<img width="143" height="24" alt="Comfama" src="public/comfama-logo.svg" />
</div>

# Comfama — Portal de Gestión Documental

App de ejemplo para la hackatón: carga de manifiestos, facturas y documentos de carga con extracción asistida y panel personal.

View your app in AI Studio: https://ai.studio/apps/27386280-838d-48e0-9e70-c197640b7f9c

## Identidad visual

La paleta, tipografía y componentes viven en [`DESIGN.md`](DESIGN.md) — fuente única de verdad para todo cambio visual. Reglas operativas para agentes en [`AGENTS.md`](AGENTS.md) y skill en `.opencode/skills/comfama-design/SKILL.md`.

- **Paleta**: `primary #DB0061`, `foreground #303030`, `neutral #CFCFCF`, `error #EB003F`, `help #0071EB`, `alert #FFC218`.
- **Tipografía**: Roboto (400/500/700) — única familia permitida.
- **Implementación**: tokens expuestos vía Tailwind CSS v4 `@theme` en `app/globals.css`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

## Patrón de Estados de Documentos

El proyecto maneja **dos estados** para los documentos (`DocumentStatus` en `lib/store.ts`):

| Estado       | Significado                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `upload`     | Archivo recién subido. Aún no fue abierto en `/review` ni tiene datos extraídos.                              |
| `processing` | Documento abierto en `/review` (en proceso de validación) y/o con datos extraídos guardados. Es **terminal**. |

### Flujo

```
/upload  ──addDocument({status:'upload'})──▶  store
                                                │
                                                ▼
                                          status = 'upload'
                                                │
   usuario abre /review?doc=<id>                 │
                                                ▼
                              useEffect transiciona a 'processing'
                                                │
                                  usuario confirma datos
                                                ▼
                              updateDocument({status:'processing', extracted})
                                                │
                                                ▼
                                          /me?highlight=<id>
```

### Reglas

- **Origen de las transiciones**: solo `/upload` y `/review` escriben en el store. `/me` es de lectura.
- **Persistencia**: `localStorage` bajo la clave `logiflow.documents.v1` (versiónada con sufijo `.v1` para futuros cambios incompatibles).
- **Pub/sub**: `subscribe(fn)` notifica cambios a componentes en la misma pestaña. La UI de `/me` se re-renderiza automáticamente al subir o confirmar documentos desde otras rutas.
- **No hay backend**. Esta es una decisión temporal del hackatón; el plan es mover el store a una API + base de datos cuando se decida persistencia.
- **CECO**: se captura desde el input del header en `/upload` y se persiste en el documento. Es editable también dentro del formulario de `/review`.
