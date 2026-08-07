/**
 * Corrige texto OTM guardado con mojibake UTF-8→WIN1252
 * (ej. "verificaciÃ³n" → "verificación").
 *
 * Uso (desde carpeta backend/):
 *
 *   # Solo listar (no modifica)
 *   node scripts/fix-otm-mojibake-encoding.js --db=db1
 *
 *   # Aplicar correcciones
 *   node scripts/fix-otm-mojibake-encoding.js --db=db1 --apply
 *
 * Bases en .env: FB_DATABASE_1 (db1), FB_DATABASE_2 (db2), FB_DATABASE_3 (db3)
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import db, { fixUtf8Mojibake, toFirebirdBlobText } from '../src/db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const dbArg = args.find((a) => a.startsWith('--db='))
const dbId = dbArg ? dbArg.split('=')[1].trim() : 'db1'

const FIELDS = [
  {
    name: 'COMENTARIOS_DE_CIERRE',
    selectSql: `
      SELECT ID_NUMERICO, ID_OTM,
             CAST(COMENTARIOS_DE_CIERRE AS VARCHAR(2000)) AS TEXTO
      FROM OTM
      WHERE COMENTARIOS_DE_CIERRE IS NOT NULL
    `,
    updateSql: `
      UPDATE OTM
      SET COMENTARIOS_DE_CIERRE = ?
      WHERE ID_NUMERICO = ?
    `
  },
  {
    name: 'OBSERVACION_OTM',
    selectSql: `
      SELECT ID_NUMERICO, ID_OTM,
             CAST(OBSERVACION_OTM AS VARCHAR(2000)) AS TEXTO
      FROM OTM
      WHERE OBSERVACION_OTM IS NOT NULL
    `,
    updateSql: `
      UPDATE OTM
      SET OBSERVACION_OTM = ?
      WHERE ID_NUMERICO = ?
    `
  }
]

function looksLikeMojibake(text) {
  return typeof text === 'string' && /[ÃÂ]/.test(text)
}

async function fixField(field) {
  const rows = await db.query(field.selectSql, [])
  const list = Array.isArray(rows) ? rows : []
  let candidates = 0
  let updated = 0

  console.log(`\n=== Campo ${field.name} (${list.length} filas con valor) ===`)

  for (const row of list) {
    const original = row.TEXTO
    if (!looksLikeMojibake(original)) continue

    const fixed = fixUtf8Mojibake(original)
    if (!fixed || fixed === original) continue

    candidates++
    console.log(`[${row.ID_OTM}] ID_NUMERICO=${row.ID_NUMERICO}`)
    console.log(`  ANTES: ${original}`)
    console.log(`  DESPUÉS: ${fixed}`)

    if (apply) {
      await db.query(field.updateSql, [toFirebirdBlobText(fixed), row.ID_NUMERICO])
      updated++
    }
  }

  return { candidates, updated }
}

async function main() {
  console.log(`BD: ${dbId} | modo: ${apply ? 'APPLY (escribe en BD)' : 'DRY-RUN (solo lista)'}`)
  console.log('Tip: sin --apply no se modifica nada.')

  await db.asyncLocalStorage.run(dbId, async () => {
    let totalCandidates = 0
    let totalUpdated = 0

    for (const field of FIELDS) {
      const { candidates, updated } = await fixField(field)
      totalCandidates += candidates
      totalUpdated += updated
    }

    console.log('\n--- Resumen ---')
    console.log(`Registros con mojibake: ${totalCandidates}`)
    if (apply) {
      console.log(`Actualizados: ${totalUpdated}`)
    } else if (totalCandidates > 0) {
      console.log('Para aplicar: node scripts/fix-otm-mojibake-encoding.js --db=' + dbId + ' --apply')
    }
  })

  process.exit(0)
}

main().catch((err) => {
  console.error('Error en script de corrección:', err)
  process.exit(1)
})
