const CURRENCY = 'Rp';

async function fetchJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Gagal memuat '+path);
  return await res.json();
}

function rupiah(n){
  try{
    return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n);
  }catch(e){ return CURRENCY + ' ' + (n||0).toLocaleString('id-ID'); }
}

function cardHTML(p){
  const badge = p.kategori ? `<span class="absolute left-2 top-2 bg-white/90 text-gray-800 text-xs px-2 py-0.5 rounded-full shadow">${p.kategori}</span>`: '';
  return `
  <div class="rounded-2xl bg-white shadow hover:shadow-lg transition overflow-hidden">
    <div class="relative">
      <img src="${p.foto||'assets/img/placeholder.webp'}" alt="${p.nama}" class="w-full h-48 object-cover">
      ${badge}
    </div>
    <div class="p-4 space-y-1">
      <h3 class="font-semibold line-clamp-2">${p.nama}</h3>
      <p class="text-sm text-gray-500">${p.mobil||''}</p>
      <p class="font-bold text-purple-700">${rupiah(p.harga)}</p>
      <div class="flex gap-2 pt-2">
        <a class="btn-secondary" href="https://wa.me/6282121145200?text=${encodeURIComponent('Halo Admin EAS, saya minat: '+p.nama+' | '+rupiah(p.harga)+' | Kode: '+(p.kode||'-'))}">Tanya via WA</a>
        ${p.link? `<a href="${p.link}" class="btn-primary">Beli</a>`:''}
      </div>
    </div>
  </div>`;
}

async function loadFeatured(){
  const container = document.getElementById('featured');
  if(!container) return;
  const data = await fetchJSON('products.json');
  const featured = data.filter(x=>x.featured).slice(0,6);
  container.innerHTML = featured.map(cardHTML).join('');
}

async function loadProducts(){
  const all = await fetchJSON('products.json');
  const grid = document.getElementById('productGrid');
  const search = document.getElementById('searchInput');
  const category = document.getElementById('categorySelect');
  const reset = document.getElementById('resetBtn');
  const loadMore = document.getElementById('loadMoreBtn');

  let page = 1;
  const PAGE_SIZE = 12;

  function filter(){
    const q = (search.value||'').toLowerCase();
    const cat = (category.value||'').toLowerCase();
    return all.filter(p=>{
      const checkQ = !q || [p.nama, p.mobil, p.kode, p.kategori].join(' ').toLowerCase().includes(q);
      const checkC = !cat || (p.kategori||'').toLowerCase() === cat;
      return checkQ && checkC;
    });
  }

  function render(){
    const items = filter();
    const end = page * PAGE_SIZE;
    grid.innerHTML = items.slice(0, end).map(cardHTML).join('');
    if(end >= items.length){ loadMore.classList.add('hidden'); } else { loadMore.classList.remove('hidden'); }
  }

  search.addEventListener('input', ()=>{ page=1; render(); });
  category.addEventListener('change', ()=>{ page=1; render(); });
  reset.addEventListener('click', ()=>{ search.value=''; category.value=''; page=1; render(); });
  loadMore.addEventListener('click', ()=>{ page++; render(); });

  render();
}
