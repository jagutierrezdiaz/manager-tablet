import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const decodeAs = process.env.FB_STRING_DECODE || 'latin1'

function patchReader(ReaderClass) {
  if (!ReaderClass?.prototype) return

  const origReadText = ReaderClass.prototype.readText
  if (origReadText) {
    ReaderClass.prototype.readText = function (len, encoding) {
      const enc = encoding === 'UTF8' || encoding === 'utf8' ? decodeAs : encoding
      return origReadText.call(this, len, enc)
    }
  }

  const origReadString = ReaderClass.prototype.readString
  if (origReadString) {
    ReaderClass.prototype.readString = function (encoding) {
      const enc = encoding === 'UTF8' || encoding === 'utf8' ? decodeAs : encoding
      return origReadString.call(this, enc)
    }
  }
}

const { BlrReader, XdrReader } = require('node-firebird/lib/wire/serialize.js')
patchReader(BlrReader)
patchReader(XdrReader)
