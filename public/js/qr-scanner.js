(() => {
  const video = document.getElementById('qrVideo');
  const startButton = document.getElementById('startScanner');
  const message = document.getElementById('scannerMessage');
  const placeholder = document.getElementById('scannerPlaceholder');
  const photoInput = document.getElementById('qrPhoto');
  const manualForm = document.getElementById('manualCodeForm');
  const codeInput = document.getElementById('propertyCode');

  if (!video || !startButton) return;

  let stream = null;
  let detector = null;
  let scanning = false;
  let scanTimer = null;

  const setMessage = (text, type = '') => {
    message.textContent = text;
    message.className = `scanner-message ${type}`.trim();
  };

  const cleanCode = (value) => String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toUpperCase();

  const openCode = (code) => {
    const safeCode = cleanCode(code);
    if (!safeCode) {
      setMessage('No pudimos obtener un código válido.', 'error');
      return;
    }
    stopCamera();
    window.location.href = `/r/${encodeURIComponent(safeCode)}`;
  };

  const handleQrValue = (rawValue) => {
    if (!rawValue) return false;
    const value = String(rawValue).trim();

    try {
      const url = new URL(value, window.location.origin);
      const match = url.pathname.match(/^\/r\/([^/?#]+)/i);
      if (match && match[1]) {
        openCode(decodeURIComponent(match[1]));
        return true;
      }
    } catch (_) {}

    const possibleCode = cleanCode(value);
    if (possibleCode && possibleCode.length >= 3 && possibleCode.length <= 30) {
      openCode(possibleCode);
      return true;
    }

    setMessage('El QR fue leído, pero no parece ser un QR de QCASA.', 'error');
    return false;
  };

  const createDetector = () => {
    if (!('BarcodeDetector' in window)) return null;
    try {
      return new BarcodeDetector({ formats: ['qr_code'] });
    } catch (_) {
      return null;
    }
  };

  const scanFrame = async () => {
    if (!scanning || !detector || video.readyState < 2) return;
    try {
      const codes = await detector.detect(video);
      if (codes && codes.length) {
        setMessage('QR detectado. Abriendo propiedad…', 'success');
        handleQrValue(codes[0].rawValue);
      }
    } catch (_) {}
  };

  const startCamera = async () => {
    detector = createDetector();

    if (!detector) {
      setMessage('Tu navegador no permite lectura automática. Podés tomar una foto del QR o ingresar el código.', 'warning');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMessage('Este navegador no permite acceder a la cámara. Usá el código manual.', 'error');
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      video.srcObject = stream;
      await video.play();
      placeholder.hidden = true;
      scanning = true;
      startButton.textContent = '■ Detener cámara';
      setMessage('Apuntá al QR y mantenelo dentro del recuadro.', 'success');
      scanTimer = window.setInterval(scanFrame, 450);
    } catch (_) {
      setMessage('No pudimos abrir la cámara. Revisá el permiso del navegador o usá el código manual.', 'error');
    }
  };

  function stopCamera() {
    scanning = false;
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    video.srcObject = null;
    if (placeholder) placeholder.hidden = false;
    startButton.textContent = '📷 Abrir cámara';
  }

  startButton.addEventListener('click', () => {
    if (scanning) {
      stopCamera();
      setMessage('Cámara detenida.');
      return;
    }
    startCamera();
  });

  photoInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    detector = detector || createDetector();
    if (!detector) {
      setMessage('Tu navegador no puede leer el QR desde una foto. Ingresá el código manualmente.', 'warning');
      photoInput.value = '';
      return;
    }

    try {
      setMessage('Leyendo la foto…');
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      if (bitmap.close) bitmap.close();

      if (!codes || !codes.length) {
        setMessage('No encontramos un QR en la foto. Probá nuevamente.', 'error');
        return;
      }

      setMessage('QR detectado. Abriendo propiedad…', 'success');
      handleQrValue(codes[0].rawValue);
    } catch (_) {
      setMessage('No pudimos leer esa imagen. Probá nuevamente o ingresá el código.', 'error');
    } finally {
      photoInput.value = '';
    }
  });

  manualForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = cleanCode(codeInput.value);
    if (!code) {
      setMessage('Ingresá el código que aparece debajo del QR.', 'error');
      codeInput.focus();
      return;
    }
    openCode(code);
  });

  window.addEventListener('pagehide', stopCamera);
})();
