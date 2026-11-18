/**
 * titipjualsecond - Zalora E-Commerce Storefront Engine
 */

const state = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('tjs_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('tjs_wishlist') || '[]'),
  
  // Filters
  department: 'all',
  selectedBrands: [],
  selectedGrades: [],
  selectedSize: null,
  priceRange: 'all',
  searchQuery: '',
  brandQuery: '',
  sortBy: 'default',
  
  selectedProduct: null
};

// Currency Formatter
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('toast-animate');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-animate');
  }, 2800);
}

// Load Products
function loadStorefront() {
  state.products = Store.getAll();
  renderBrandList();
  applyFilters();
  updateCartBadge();
  updateWishlistBadge();
}

// Render Brand Checkbox List
function renderBrandList() {
  const container = document.getElementById('brandListContainer');
  if (!container) return;

  // Extract unique brands with counts
  const brandCounts = {};
  state.products.forEach(p => {
    const b = p.brand || 'Lainnya';
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  });

  const brands = Object.keys(brandCounts).sort();
  const query = state.brandQuery.toLowerCase().trim();
  const filteredBrands = query ? brands.filter(b => b.toLowerCase().includes(query)) : brands;

  if (filteredBrands.length === 0) {
    container.innerHTML = '<p class="text-zinc-400 text-[11px] italic">Brand tidak ditemukan.</p>';
    return;
  }

  container.innerHTML = filteredBrands.map(b => {
    const checked = state.selectedBrands.includes(b) ? 'checked' : '';
    return `
      <label class="flex items-center justify-between cursor-pointer hover:text-black py-0.5">
        <div class="flex items-center gap-2">
          <input type="checkbox" value="${b}" ${checked} onchange="toggleBrandFilter('${b}')" class="rounded text-black focus:ring-0">
          <span class="text-xs">${b}</span>
        </div>
        <span class="text-[10px] text-zinc-400">(${brandCounts[b]})</span>
      </label>
    `;
  }).join('');
}

function toggleBrandFilter(brand) {
  const idx = state.selectedBrands.indexOf(brand);
  if (idx === -1) {
    state.selectedBrands.push(brand);
  } else {
    state.selectedBrands.splice(idx, 1);
  }
  applyFilters();
}

// Department Sub-nav
function setDepartment(dept) {
  state.department = dept;
  document.querySelectorAll('.dept-nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dept === dept);
  });

  const titles = {
    'all': 'Koleksi Barang Second Pilihan',
    'wanita': 'Koleksi Second Wanita',
    'pria': 'Koleksi Second Pria',
    'footwear': 'Sneakers & Sepatu Second Terkurasi',
    'clothing': 'Pakaian & Vintage Jackets',
    'gadgets': 'Kamera Analog & Audio Studio',
    'accessories': 'Jam Tangan & Luxury Archive'
  };

  const elTitle = document.getElementById('catalogHeaderTitle');
  const elBreadcrumb = document.getElementById('breadcrumbCategory');
  if (elTitle) elTitle.textContent = titles[dept] || 'Katalog Terkurasi';
  if (elBreadcrumb) elBreadcrumb.textContent = titles[dept] || 'Koleksi';

  applyFilters();
}

// Size Pill Toggle
function toggleSizeFilter(btn, size) {
  const allBtns = document.querySelectorAll('.size-btn');
  if (state.selectedSize === size) {
    state.selectedSize = null;
    btn.classList.remove('bg-black', 'text-white', 'border-black');
    btn.classList.add('border-zinc-200', 'text-zinc-700');
  } else {
    allBtns.forEach(b => {
      b.classList.remove('bg-black', 'text-white', 'border-black');
      b.classList.add('border-zinc-200', 'text-zinc-700');
    });
    state.selectedSize = size;
    btn.classList.remove('border-zinc-200', 'text-zinc-700');
    btn.classList.add('bg-black', 'text-white', 'border-black');
  }
  applyFilters();
}

// Reset All Filters
function resetAllFilters() {
  state.department = 'all';
  state.selectedBrands = [];
  state.selectedGrades = [];
  state.selectedSize = null;
  state.priceRange = 'all';
  state.searchQuery = '';
  state.brandQuery = '';
  state.sortBy = 'default';

  // reset DOM
  const searchInput = document.getElementById('searchInput');
  const brandSearch = document.getElementById('brandSearchInput');
  const sortSelect = document.getElementById('sortSelect');
  if (searchInput) searchInput.value = '';
  if (brandSearch) brandSearch.value = '';
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('input[name="gradeFilter"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="priceRange"]').forEach(r => r.checked = (r.value === 'all'));
  document.querySelectorAll('.size-btn').forEach(b => {
    b.classList.remove('bg-black', 'text-white', 'border-black');
    b.classList.add('border-zinc-200', 'text-zinc-700');
  });
  document.querySelectorAll('.dept-nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dept === 'all');
  });

  renderBrandList();
  applyFilters();
}

// Apply Filters
function applyFilters() {
  let list = [...state.products];

  // 1. Department Filter
  if (state.department !== 'all') {
    if (state.department === 'wanita' || state.department === 'pria') {
      list = list.filter(p => p.gender === state.department || p.gender === 'unisex');
    } else {
      list = list.filter(p => p.category === state.department);
    }
  }

  // 2. Brand Filter
  if (state.selectedBrands.length > 0) {
    list = list.filter(p => state.selectedBrands.includes(p.brand));
  }

  // 3. Grade Filter
  const checkedGrades = Array.from(document.querySelectorAll('input[name="gradeFilter"]:checked')).map(cb => cb.value);
  if (checkedGrades.length > 0) {
    list = list.filter(p => checkedGrades.includes(p.grade));
  }

  // 4. Size Filter
  if (state.selectedSize) {
    const s = state.selectedSize.toLowerCase();
    list = list.filter(p => (p.size || '').toLowerCase().includes(s));
  }

  // 5. Price Range Filter
  const checkedPrice = document.querySelector('input[name="priceRange"]:checked');
  const priceVal = checkedPrice ? checkedPrice.value : 'all';
  if (priceVal === 'under-2m') {
    list = list.filter(p => p.price < 2000000);
  } else if (priceVal === '2m-4m') {
    list = list.filter(p => p.price >= 2000000 && p.price <= 4000000);
  } else if (priceVal === 'above-4m') {
    list = list.filter(p => p.price > 4000000);
  }

  // 6. Search Input
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  if (q) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  // 7. Sorting
  const sort = document.getElementById('sortSelect')?.value || 'default';
  if (sort === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'discount') {
    list.sort((a, b) => {
      const discA = (a.originalPrice - a.price) / a.originalPrice;
      const discB = (b.originalPrice - b.price) / b.originalPrice;
      return discB - discA;
    });
  }

  state.filteredProducts = list;
  renderProducts();
}

// Render Zalora Style Product Cards
function renderProducts() {
  const container = document.getElementById('productGrid');
  const countEl = document.getElementById('productCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${state.filteredProducts.length} Barang ditemukan`;
  }

  if (state.filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <i data-lucide="package-search" class="w-12 h-12 mx-auto text-zinc-300 mb-2"></i>
        <h4 class="text-sm font-bold text-black mb-1">Barang tidak ditemukan</h4>
        <p class="text-xs text-zinc-400 mb-4">Coba sesuaikan filter brand, ukuran, atau reset filter Anda.</p>
        <button onclick="resetAllFilters()" class="text-xs font-bold px-4 py-2 bg-black text-white rounded">
          Reset Filter
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = state.filteredProducts.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    const isSold = !p.isAvailable;
    const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';

    return `
      <div class="zalora-card bg-white border border-zinc-200/80 rounded overflow-hidden flex flex-col group cursor-pointer" onclick="openProductModal('${p.id}')">
        
        <!-- Image Container (Tall 3:4 Fashion Crop) -->
        <div class="zalora-card-img-wrap">
          <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover ${isSold ? 'grayscale-[40%]' : ''}">
          
          <!-- Rating & Grade Badge Top Left (Zalora Style) -->
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/95 text-zinc-800 shadow-2xs backdrop-blur-xs">
              <span class="text-amber-500">★</span> 5.0 • ${p.grade}
            </span>
            ${isSold ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase shadow-xs">
                TERJUAL
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded text-[9px] font-bold ${gradeClass} shadow-2xs">
                ${p.gradeScore}
              </span>
            `}
          </div>

          <!-- Wishlist Heart Button Top Right -->
          <button 
            onclick="event.stopPropagation(); toggleWishlist('${p.id}')"
            class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-white shadow-xs transition z-10"
            title="Simpan ke Wishlist"
          >
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}"></i>
          </button>

          <!-- Hover "Temukan yang Serupa" / Quick View Button in Center -->
          <div class="absolute inset-x-4 bottom-4 z-10 quick-view-hover">
            <button class="w-full py-2 bg-white/95 backdrop-blur-xs text-black text-xs font-bold uppercase tracking-wider rounded shadow-md hover:bg-black hover:text-white transition">
              Lihat Rincian
            </button>
          </div>

          <!-- Bottom Single Item Tag -->
          ${!isSold ? `
            <div class="absolute bottom-2 left-2.5 z-10 bg-white/90 px-2 py-0.5 rounded text-[9px] font-medium text-zinc-600 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 1 Unit Saja
            </div>
          ` : ''}
        </div>

        <!-- Card Content Info -->
        <div class="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <!-- Brand in Bold Uppercase -->
            <div class="text-[11px] font-extrabold text-black uppercase tracking-wider mb-0.5">
              ${p.brand}
            </div>

            <!-- Product Title -->
            <h3 class="text-xs text-zinc-800 line-clamp-1 group-hover:text-black transition">
              ${p.name}
            </h3>

            <!-- Size / Subtitle -->
            <p class="text-[11px] text-zinc-400 mt-0.5">
              ${p.size || 'All Size'} • ${p.categoryLabel}
            </p>
          </div>

          <!-- Price Row -->
          <div class="pt-2.5 mt-2 border-t border-zinc-100">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-sm font-extrabold text-black">${formatRupiah(p.price)}</span>
              ${p.originalPrice > p.price ? `
                <span class="text-[11px] text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
                <span class="text-[10px] font-bold text-red-600">${discount}% OFF</span>
              ` : ''}
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// Wishlist
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);
  if (index === -1) {
    state.wishlist.push(productId);
    showToast(`"${product.name.substring(0, 20)}..." disimpan ke Wishlist`);
  } else {
    state.wishlist.splice(index, 1);
    showToast(`Dihapus dari Wishlist`);
  }
  localStorage.setItem('tjs_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadge();
  renderProducts();
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlistCountBadge');
  if (badge) {
    const c = state.wishlist.length;
    badge.textContent = c;
    badge.classList.toggle('hidden', c === 0);
  }
}

// Cart Management
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  if (!product.isAvailable) {
    showToast('Maaf, barang ini sudah Terjual (Sold Out).');
    return;
  }

  const exists = state.cart.find(i => i.id === productId);
  if (exists) {
    showToast('Barang ini sudah ada di kantong belanja Anda (stok hanya 1 unit).');
    openCartDrawer();
    return;
  }

  state.cart.push({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.images[0],
    grade: product.grade,
    size: product.size
  });

  saveCart();
  showToast('Ditambahkan ke kantong belanja');
  openCartDrawer();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  showToast('Barang dihapus dari kantong belanja');
}

function saveCart() {
  localStorage.setItem('tjs_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    const c = state.cart.length;
    badge.textContent = c;
    badge.classList.toggle('hidden', c === 0);
  }
}

function openCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('translate-x-full');
  document.getElementById('cartBackdrop').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  renderCart();
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.add('translate-x-full');
  document.getElementById('cartBackdrop').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function renderCart() {
  const empty = document.getElementById('cartEmptyState');
  const content = document.getElementById('cartContentState');
  const container = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');

  if (state.cart.length === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  content.classList.remove('hidden');

  let subtotal = 0;
  container.innerHTML = state.cart.map(item => {
    subtotal += item.price;
    return `
      <div class="flex gap-4 py-4 items-start">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded border border-zinc-200 shrink-0">
        <div class="flex-1 min-w-0">
          <span class="text-[10px] font-bold uppercase text-black block">${item.brand || 'TITIPJUALSECOND'}</span>
          <h4 class="text-xs font-semibold text-zinc-900 line-clamp-1">${item.name}</h4>
          <p class="text-[11px] text-zinc-500 mt-0.5">${item.size || 'Standar'} • ${item.grade}</p>
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs font-extrabold text-black">${formatRupiah(item.price)}</span>
            <button onclick="removeFromCart('${item.id}')" class="text-xs text-red-500 hover:text-red-700 font-medium">
              Hapus
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
}

// Product Detail Modal
function openProductModal(productId) {
  const p = Store.getById(productId);
  if (!p) return;
  state.selectedProduct = p;

  const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  const isSold = !p.isAvailable;
  const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';

  document.getElementById('productModalContent').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Image Gallery -->
      <div>
        <div class="aspect-[3/4] bg-zinc-100 rounded overflow-hidden border border-zinc-200 relative mb-3">
          <img id="modalMainImg" src="${p.images[0]}" class="w-full h-full object-cover ${isSold ? 'grayscale-[35%]' : ''}">
          ${isSold ? `
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span class="px-4 py-2 bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest rounded shadow-lg">
                BARANG INI SUDAH TERJUAL
              </span>
            </div>
          ` : ''}
        </div>
        ${p.images.length > 1 ? `
          <div class="flex gap-2">
            ${p.images.map(img => `
              <button onclick="document.getElementById('modalMainImg').src='${img}'" class="w-16 h-20 rounded overflow-hidden border border-zinc-200 hover:border-black shrink-0">
                <img src="${img}" class="w-full h-full object-cover">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Detail Info & Transparency -->
      <div class="flex flex-col justify-between h-full">
        <div>
          <div class="text-xs font-extrabold text-black uppercase tracking-wider mb-1">${p.brand}</div>
          <h2 class="text-xl font-bold text-black mb-2">${p.name}</h2>
          
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2.5 py-0.5 rounded text-[10px] font-bold ${gradeClass}">
              ${p.grade} • ${p.gradeScore} (${p.gradeBadge})
            </span>
            <span class="text-xs text-zinc-400">Kode: ${p.id}</span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 pb-4 mb-4 border-b border-zinc-200">
            <span class="text-2xl font-extrabold text-black">${formatRupiah(p.price)}</span>
            ${p.originalPrice > p.price ? `
              <span class="text-sm text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
              <span class="text-xs font-bold text-red-600">Hemat ${discount}%</span>
            ` : ''}
          </div>

          <p class="text-xs text-zinc-600 leading-relaxed mb-6">${p.description}</p>

          <!-- Transparent Checklist -->
          <div class="bg-zinc-50 border border-zinc-200 rounded p-4 mb-6 space-y-2.5">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-black flex items-center gap-1.5">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              Laporan Transparansi Kondisi (Authentic Check)
            </h4>
            <div class="text-xs space-y-1.5 pt-1">
              <div class="flex justify-between"><span class="text-zinc-500">Fisik Bodi:</span><span class="font-medium text-zinc-900">${p.conditionDetails.physical}</span></div>
              <div class="flex justify-between"><span class="text-zinc-500">Fungsi Teknis:</span><span class="font-medium text-emerald-700">${p.conditionDetails.function}</span></div>
              <div class="flex justify-between"><span class="text-zinc-500">Kelengkapan:</span><span class="font-medium text-zinc-800">${p.conditionDetails.completeness}</span></div>
              <div class="flex justify-between"><span class="text-zinc-500">Catatan Minus:</span><span class="font-medium text-amber-700 bg-amber-50 px-1 rounded">${p.conditionDetails.defect}</span></div>
              <div class="flex justify-between"><span class="text-zinc-500">Asal Barang:</span><span class="italic text-zinc-600">${p.conditionDetails.origin}</span></div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div>
          ${isSold ? `
            <div class="p-3 bg-red-50 border border-red-200 text-center rounded text-xs font-bold text-red-700">
              Barang ini sudah terjual ke pembeli lain.
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-3">
              <button onclick="addToCart('${p.id}'); closeProductModal();" class="py-3 px-4 border border-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 transition rounded flex items-center justify-center gap-1.5">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                + Kantong Belanja
              </button>
              <button onclick="buyNowSingle('${p.id}')" class="py-3 px-4 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition rounded flex items-center justify-center gap-1.5 shadow-sm">
                Beli Sekarang
              </button>
            </div>
            <p class="text-center text-[10px] text-zinc-400 mt-2">Garansi uang kembali 100% jika kondisi tidak sesuai laporan transparansi di atas.</p>
          `}
        </div>

      </div>
    </div>
  `;

  document.getElementById('productModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function buyNowSingle(productId) {
  addToCart(productId);
  closeProductModal();
  openCheckoutModal();
}

// Checkout Modal
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Kantong belanja Anda masih kosong.');
    return;
  }
  closeCartDrawer();
  document.getElementById('checkoutModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Buyer Checkout Form Submission (TRIGGERS REALTIME ADMIN POPUP!)
function handleBuyerCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const courier = document.getElementById('custCourier').value;
  const notes = document.getElementById('custNotes').value.trim();

  let subtotal = 0;
  const items = state.cart.map(item => {
    subtotal += item.price;
    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      grade: item.grade,
      size: item.size
    };
  });

  // 1. Simpan order ke Store (otomatis memicu popup realtime di browser admin)
  const order = Store.createOrder({
    name,
    phone,
    address,
    courier,
    notes,
    items,
    totalAmount: subtotal
  });

  // 2. Format WhatsApp pesan ke admin
  let waItems = '';
  items.forEach((it, idx) => {
    waItems += `${idx + 1}. ${it.name} (${it.grade}) - ${formatRupiah(it.price)}%0A`;
  });

  const waNumber = "6281234567890";
  let message = `*PESANAN BARU TITIPJUALSECOND*%0A`;
  message += `Invoice: *#${order.orderId}*%0A%0A`;
  message += `*Daftar Barang:*%0A${waItems}%0A`;
  message += `*Total Pembayaran:* ${formatRupiah(subtotal)}%0A%0A`;
  message += `*Data Pengiriman:*%0A`;
  message += `• Nama: ${encodeURIComponent(name)}%0A`;
  message += `• WhatsApp: ${encodeURIComponent(phone)}%0A`;
  message += `• Alamat: ${encodeURIComponent(address)}%0A`;
  message += `• Ekspedisi: ${encodeURIComponent(courier)}%0A`;
  if (notes) message += `• Catatan: ${encodeURIComponent(notes)}%0A`;
  message += `%0AMohon konfirmasi rekening transfer untuk pembayaran pesanan ini. Terima kasih!`;

  // 3. Reset Cart
  state.cart = [];
  saveCart();
  closeCheckoutModal();
  showToast('Pesanan berhasil dibuat! Menghubungkan ke admin via WhatsApp...');

  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// Security: Admin Auth Modal Gate
function openAuthModal() {
  document.getElementById('adminPinInput').value = '';
  document.getElementById('authModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  document.getElementById('adminPinInput').focus();
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function handleAdminLogin(e) {
  e.preventDefault();
  const pin = document.getElementById('adminPinInput').value;

  if (Store.loginAdmin(pin)) {
    closeAuthModal();
    showToast('Login Admin Berhasil! Mengalihkan ke CMS...');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 600);
  } else {
    alert('Password / PIN Admin salah! Akses ditolak.');
    document.getElementById('adminPinInput').value = '';
    document.getElementById('adminPinInput').focus();
  }
}

// Event Listeners Init
function initStorefrontEvents() {
  // Brand search input
  const brandSearch = document.getElementById('brandSearchInput');
  if (brandSearch) {
    brandSearch.addEventListener('input', (e) => {
      state.brandQuery = e.target.value;
      renderBrandList();
    });
  }

  // Header search input on Enter
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') applyFilters();
    });
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeCheckoutModal();
      closeAuthModal();
    }
  });

  // Listen to product updates from Admin CMS
  window.addEventListener('titipjualsecond:updated', () => {
    state.products = Store.getAll();
    renderBrandList();
    applyFilters();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadStorefront();
  initStorefrontEvents();
});
