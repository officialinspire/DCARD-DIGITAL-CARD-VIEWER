(function (global) {
  function openTradeModal(tradeUrl) {
    const modal = document.getElementById('tradeModal');
    const linkEl = document.getElementById('tradeLink');
    const qrCanvas = document.getElementById('tradeQr');
    const copyBtn = document.getElementById('btnCopyTrade');
    const closeBtn = document.getElementById('btnCloseTrade');

    if (!modal || !qrCanvas || !window.QRCode) return;

    linkEl.value = tradeUrl;
    modal.classList.add('show');

    QRCode.toCanvas(qrCanvas, tradeUrl, { width: 240 }, (err) => {
      if (err) console.error('QR render failed', err);
    });

    function close() {
      modal.classList.remove('show');
    }

    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(tradeUrl);
        if (global.showToast) global.showToast('Copied trade link to clipboard');
      } catch (err) {
        console.warn('Copy failed', err);
      }
    };

    closeBtn.onclick = close;
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  global.TradeQR = { openTradeModal };
})(typeof window !== 'undefined' ? window : globalThis);
