// Minimal zip reader: entries(file) -> [{name, read()}] (stored or deflated)
const fs = require('fs'), zlib = require('zlib')
function entries(file) {
  const fd = fs.openSync(file, 'r'), size = fs.fstatSync(fd).size
  const tailLen = Math.min(size, 65557), tail = Buffer.alloc(tailLen)
  fs.readSync(fd, tail, 0, tailLen, size - tailLen)
  let eocd = -1
  for (let i = tailLen - 22; i >= 0; i--) if (tail.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  if (eocd < 0) { fs.closeSync(fd); return [] }
  let count = tail.readUInt16LE(eocd + 10), cdSize = tail.readUInt32LE(eocd + 12), cdOff = tail.readUInt32LE(eocd + 16)
  const cd = Buffer.alloc(cdSize); fs.readSync(fd, cd, 0, cdSize, cdOff)
  const out = []; let p = 0
  for (let i = 0; i < count && p < cd.length; i++) {
    const method = cd.readUInt16LE(p + 10), csize = cd.readUInt32LE(p + 20), nlen = cd.readUInt16LE(p + 28), elen = cd.readUInt16LE(p + 30), clen = cd.readUInt16LE(p + 32), loff = cd.readUInt32LE(p + 42)
    const name = cd.toString('utf8', p + 46, p + 46 + nlen)
    p += 46 + nlen + elen + clen
    out.push({ name, read: () => {
      const lh = Buffer.alloc(30); fs.readSync(fd, lh, 0, 30, loff)
      const start = loff + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28)
      const data = Buffer.alloc(csize); fs.readSync(fd, data, 0, csize, start)
      return method === 0 ? data : zlib.inflateRawSync(data)
    } })
  }
  out.close = () => fs.closeSync(fd)
  return out
}
module.exports = { entries }
