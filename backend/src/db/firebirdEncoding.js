import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/** Node encoding para texto Firebird WIN1252/NONE (≈ latin1). */
export const firebirdNodeEncoding = process.env.FB_STRING_DECODE || 'latin1'

function isUtf8Label(encoding) {
  return encoding === 'UTF8' || encoding === 'utf8'
}

/**
 * Lectura VARCHAR/CHAR: node-firebird usa Const.DEFAULT_ENCODING='UTF8'.
 * Los bytes en BD son WIN1252 → decodificar como latin1.
 * No se parchean Buffer.from / toString / byteLength de forma global
 * (rompían lectura de blobs/CAST y mensajes con tildes).
 */
function patchReader(ReaderClass) {
  if (!ReaderClass?.prototype) return

  const origReadText = ReaderClass.prototype.readText
  if (origReadText) {
    ReaderClass.prototype.readText = function (len, encoding) {
      const enc = isUtf8Label(encoding) ? firebirdNodeEncoding : encoding
      return origReadText.call(this, len, enc)
    }
  }

  const origReadString = ReaderClass.prototype.readString
  if (origReadString) {
    ReaderClass.prototype.readString = function (encoding) {
      const enc = isUtf8Label(encoding) ? firebirdNodeEncoding : encoding
      return origReadString.call(this, enc)
    }
  }
}

const Const = require('node-firebird/lib/wire/const.js')
const { BlrReader, XdrReader } = require('node-firebird/lib/wire/serialize.js')
patchReader(BlrReader)
patchReader(XdrReader)

/**
 * Escritura VARCHAR: forzar latin1 en el wire (DEFAULT_ENCODING UTF8 guardaba Ã³).
 */
const { SQLParamString } = require('node-firebird/lib/wire/xsqlvar.js')
if (SQLParamString?.prototype) {
  SQLParamString.prototype.encode = function (data) {
    if (this.value != null) {
      const text = Buffer.isBuffer(this.value)
        ? this.value.toString(firebirdNodeEncoding)
        : String(this.value)
      data.addText(text, firebirdNodeEncoding)
    } else {
      data.addInt(1)
    }
  }
  SQLParamString.prototype.calcBlr = function (blr) {
    blr.addByte(Const.blr_text)
    let len = 0
    if (this.value != null) {
      if (Buffer.isBuffer(this.value)) {
        len = this.value.length
      } else {
        len = Buffer.byteLength(String(this.value), firebirdNodeEncoding)
      }
    }
    blr.addWord(len)
  }
}

/**
 * Escritura BLOB SUB_TYPE TEXT: putBlobData envía Buffer en crudo
 * (si se pasa string, el driver usa UTF8 y corrompe tildes/ñ).
 */
export function toFirebirdBlobText(value) {
  if (value == null) return value
  if (Buffer.isBuffer(value)) return value
  return Buffer.from(String(value), firebirdNodeEncoding)
}

/**
 * Por si algún BLOB se lee aún como UTF-8 mal interpretado (Ã³).
 * No recupera � (replacement); eso requiere leer con latin1 desde el origen.
 */
export function fromFirebirdText(value) {
  if (value == null || typeof value !== 'string') return value
  if (!/[ÃÂ]/.test(value)) return value
  try {
    const fixed = Buffer.from(value, 'latin1').toString('utf8')
    if (fixed.includes('\uFFFD') || fixed === value) return value
    const before = (value.match(/Ã.|Â./g) || []).length
    const after = (fixed.match(/Ã.|Â./g) || []).length
    return after < before ? fixed : value
  } catch {
    return value
  }
}
