const QRCode = require('qrcode');

async function qrDataUrl(code) {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return QRCode.toDataURL(`${base}/r/${code}`, { margin: 1, width: 420 });
}

module.exports = { qrDataUrl };
