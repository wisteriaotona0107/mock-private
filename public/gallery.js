async function renderGallery() {
  const res = await fetch('data/gallery.json');
  const data = await res.json();
  const container = document.getElementById('galleryFull');
  container.innerHTML = data.items
    .map((item) => `<img src="${item.src}" alt="${item.alt}" loading="lazy" />`)
    .join('');
}

document.addEventListener('DOMContentLoaded', renderGallery);
