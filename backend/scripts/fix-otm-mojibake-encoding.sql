-- =====================================================================
-- Diagnóstico manual (FlameRobin / isql): buscar textos con mojibake
-- típico UTF-8 leído como WIN1252 (Ã³, Ã¡, Ã±, etc.)
-- =====================================================================

SELECT ID_NUMERICO, ID_OTM,
       CAST(COMENTARIOS_DE_CIERRE AS VARCHAR(2000)) AS COMENTARIOS_DE_CIERRE
FROM OTM
WHERE COMENTARIOS_DE_CIERRE CONTAINING 'Ã'
   OR COMENTARIOS_DE_CIERRE CONTAINING 'Â';

SELECT ID_NUMERICO, ID_OTM,
       CAST(OBSERVACION_OTM AS VARCHAR(2000)) AS OBSERVACION_OTM
FROM OTM
WHERE OBSERVACION_OTM CONTAINING 'Ã'
   OR OBSERVACION_OTM CONTAINING 'Â';

-- =====================================================================
-- NOTA: La corrección de bytes UTF-8→WIN1252 no es práctica en SQL puro
-- de Firebird. Usar el script Node:
--
--   cd backend
--   node scripts/fix-otm-mojibake-encoding.js --db=db1
--   node scripts/fix-otm-mojibake-encoding.js --db=db1 --apply
--
-- Tras el fix de escritura (encode latin1 en db.query), los NUEVOS
-- guardados desde la tablet ya no generan Ã³ / Ã¡ / Ã±.
-- =====================================================================
