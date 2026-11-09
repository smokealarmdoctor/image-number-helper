const gallery = document.getElementById('gallery');
const alts = ['Sunset over hills', 'Coffee mug, coral', 'Team portrait', 'Mountain lake', 'Mug, teal', 'City at night',
  'Rolling fields', 'Mug, plum', 'Founder headshot', 'Downtown skyline', 'Mug, indigo', 'Desert dunes'];
alts.forEach((alt, i) => {
  const img = document.createElement('img');
  img.src = `../demo/photo-${String(i + 1).padStart(2, '0')}.svg`;
  img.alt = alt;
  gallery.appendChild(img);
});

document.getElementById('on').addEventListener('click', () => window.__inh?.enable());
document.getElementById('jump').addEventListener('click', () => {
  window.__inh?.enable();
  setTimeout(() => window.__inh?.jump(7), 200);
});
