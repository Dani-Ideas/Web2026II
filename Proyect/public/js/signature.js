const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(pos(e).x, pos(e).y); });
canvas.addEventListener('mousemove', e => { if (!drawing) return; ctx.lineTo(pos(e).x, pos(e).y); ctx.strokeStyle = '#041627'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); });
canvas.addEventListener('mouseup',   () => { drawing = false; saveSignature(); });
canvas.addEventListener('mouseleave',() => { drawing = false; });

canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const t = e.touches[0]; ctx.beginPath(); ctx.moveTo(pos(t).x, pos(t).y); });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (!drawing) return; const t = e.touches[0]; ctx.lineTo(pos(t).x, pos(t).y); ctx.strokeStyle = '#041627'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); });
canvas.addEventListener('touchend',   () => { drawing = false; saveSignature(); });

function pos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX || e.pageX) - r.left, y: (e.clientY || e.pageY) - r.top };
}

function saveSignature() {
  document.getElementById('signatureData').value = canvas.toDataURL();
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('signatureData').value = '';
}
