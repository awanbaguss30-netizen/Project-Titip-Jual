/**
 * titipjualsecond - Storefront Application Logic
 * Menampilkan katalog barang second untuk pembeli publik
 */

// App State
const state = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('tjs_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('tjs_wishlist') || '[]'),
  category: 'all',
  grade: 'all',
  sortBy: 'default',
  searchQuery: '',
  selectedProduct: null
};

// DOM Cache
const DOM = {
  productGrid: document.getElementById('productGrid'),
  productCount: document.getElementById('productCount'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  
  // Cart
  cartDrawer: document.getElementById('cartDrawer'),
  cartBackdrop: document.getElementById('cartBackdrop'),
  cartItemsContainer: document.getElementById('cartItemsContainer'),
  cartCountBadge: document.getElementById('cartCountBadge'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartEmptyState: document.getElementById('cartEmptyState'),
  cartContentState: document.getElementById('cartContentState'),
  
  // Wishlist
  wishlistCountBadge: document.getElementById('wishlistCountBadge'),
  
  // Modals
  productModal: document.getElementById('productModal'),
  productModalContent: document.getElementById('productModalContent'),
  checkoutModal: document.getElementById('checkoutModal'),
  checkoutForm: document.getElementById('checkoutForm'),
  consignmentModal: document.getElementById('consignmentModal'),
  consignmentForm: document.getElementById('consignmentForm'),
  
  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage')
};

// Currency Formatter
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Show Toast
function showToast(message) {
  if (!DOM.toast) return;
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.remove('hidden');
  DOM.toast.classList.add('toast-animate');

  setTimeout(() => {
    DOM.toast.classList.add('hidden');
    DOM.toast.classList.remove('toast-animate');
  }, 2800);
}

// Load Products from Shared Store
function loadProducts() {
  state.products = Store.getAll();
  applyFilters();
}

// LocalStorage helpers for Cart & Wishlist
function saveCart() {
  localStorage.setItem('tjs_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}

function saveWishlist() {
  localStorage.setItem('tjs_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadge();
}

function updateCartBadge() {
  const count = state.cart.length;
  if (DOM.cartCountBadge) {
    DOM.cartCountBadge.textContent = count;
    DOM.cartCountBadge.classList.toggle('hidden', count === 0);
  }
}

function updateWishlistBadge() {
  const count = state.wishlist.length;
  if (DOM.wishlistCountBadge) {
    DOM.wishlistCountBadge.textContent = count;
    DOM.wishlistCountBadge.classList.toggle('hidden', count === 0);
  }
}

// Wishlist
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);
  if (index === -1) {
    state.wishlist.push(productId);
    showToast(`"${product.name.substring(0, 25)}..." disimpan ke wishlist`);
  } else {
    state.wishlist.splice(index, 1);
    showToast(`Dihapus dari wishlist`);
  }
  saveWishlist();
  renderProducts();
}

// Cart operations
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  if (!product.isAvailable) {
    showToast('Maaf, barang ini sudah terjual (Sold Out).');
    return;
  }

  const exists = state.cart.find(item => item.id === productId);
  if (exists) {
    showToast('Barang ini sudah ada di keranjang Anda. (Stok second hanya 1 unit)');
    openCartDrawer();
    return;
  }

  state.cart.push({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    grade: product.grade,
    size: product.size,
    addedAt: Date.now()
  });

  saveCart();
  showToast(`Ditambahkan ke keranjang belanja`);
  openCartDrawer();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  showToast('Barang dihapus dari keranjang');
}

function openCartDrawer() {
  DOM.cartDrawer.classList.remove('translate-x-full');
  DOM.cartBackdrop.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  renderCart();
}

function closeCartDrawer() {
  DOM.cartDrawer.classList.add('translate-x-full');
  DOM.cartBackdrop.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function renderCart() {
  if (state.cart.length === 0) {
    DOM.cartEmptyState.classList.remove('hidden');
    DOM.cartContentState.classList.add('hidden');
    return;
  }

  DOM.cartEmptyState.classList.add('hidden');
  DOM.cartContentState.classList.remove('hidden');

  let subtotal = 0;
  DOM.cartItemsContainer.innerHTML = state.cart.map(item => {
    subtotal += item.price;
    const gradeClass = item.grade === 'Grade S' ? 'badge-grade-s' : item.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';
    return `
      <div class="flex gap-4 py-4 border-b border-zinc-100 items-start">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg border border-zinc-200 shrink-0 bg-zinc-50">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${gradeClass}">${item.grade}</span>
            <span class="text-xs text-zinc-400">1 unit saja</span>
          </div>
          <h4 class="text-sm font-medium text-zinc-900 line-clamp-1">${item.name}</h4>
          <p class="text-xs text-zinc-500 mb-2">${item.size || ''}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-zinc-900">${formatRupiah(item.price)}</span>
            <button onclick="removeFromCart('${item.id}')" class="text-xs text-red-500 hover:text-red-700 transition">
              Hapus
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  DOM.cartSubtotal.textContent = formatRupiah(subtotal);
}

// Filters & Search
function applyFilters() {
  let result = [...state.products];

  if (state.category !== 'all') {
    result = result.filter(p => p.category === state.category);
  }

  if (state.grade !== 'all') {
    result = result.filter(p => p.grade === state.grade);
  }

  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase().trim();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.categoryLabel.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  if (state.sortBy === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'discount') {
    result.sort((a, b) => {
      const discA = (a.originalPrice - a.price) / a.originalPrice;
      const discB = (b.originalPrice - b.price) / b.originalPrice;
      return discB - discA;
    });
  }

  state.filteredProducts = result;
  renderProducts();
}

function renderProducts() {
  if (!DOM.productGrid) return;

  DOM.productCount.textContent = `${state.filteredProducts.length} barang terkurasi`;

  if (state.filteredProducts.length === 0) {
    DOM.productGrid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-base font-medium text-zinc-800 mb-1">Barang tidak ditemukan</h3>
        <p class="text-sm text-zinc-500 mb-4">Coba ganti kata kunci atau pilih kategori lain.</p>
        <button onclick="resetFilters()" class="text-xs font-semibold px-4 py-2 border border-zinc-900 rounded-full hover:bg-zinc-900 hover:text-white transition">
          Reset Filter
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  DOM.productGrid.innerHTML = state.filteredProducts.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';
    const isSold = !p.isAvailable;

    return `
      <div class="product-card bg-white rounded-xl border border-zinc-200/80 overflow-hidden flex flex-col group ${isSold ? 'opacity-85' : ''}">
        <!-- Image Container -->
        <div class="product-image-container relative aspect-[4/3] bg-zinc-100 cursor-pointer" onclick="openProductModal('${p.id}')">
          <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover ${isSold ? 'grayscale-[40%]' : ''}">
          
          <!-- Badges Overlay -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            ${isSold ? `
              <span class="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-600 text-white shadow-md">
                TERJUAL / SOLD
              </span>
            ` : `
              <span class="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full ${gradeClass} shadow-sm backdrop-blur-sm">
                ${p.grade} • ${p.gradeScore}
              </span>
            `}

            ${discount > 0 && !isSold ? `
              <span class="text-[10px] font-semibold bg-zinc-900/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                Hemat ${discount}%
              </span>
            ` : ''}
          </div>

          <!-- Wishlist Heart -->
          <button 
            onclick="event.stopPropagation(); toggleWishlist('${p.id}')"
            class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-white shadow-sm transition"
            title="Simpan ke Wishlist"
          >
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}"></i>
          </button>

          <!-- Single Item Badge -->
          ${!isSold ? `
            <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[10px] font-medium text-zinc-600 flex items-center gap-1 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              1 Unit Tersedia
            </div>
          ` : `
            <div class="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[10px] font-medium text-white shadow-xs">
              Stok Habis
            </div>
          `}
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span>${p.brand}</span>
              <span>${p.categoryLabel}</span>
            </div>
            
            <h3 onclick="openProductModal('${p.id}')" class="font-medium text-sm text-zinc-900 line-clamp-2 hover:text-zinc-600 transition cursor-pointer mb-2">
              ${p.name}
            </h3>

            <p class="text-xs text-zinc-500 line-clamp-1 mb-3">
              <span class="text-zinc-700 font-medium">${p.gradeBadge}</span> — ${p.size || 'Koleksi Asli'}
            </p>
          </div>

          <div class="pt-3 border-t border-zinc-100 mt-2">
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-base font-semibold text-zinc-900">${formatRupiah(p.price)}</span>
              ${p.originalPrice > p.price ? `
                <span class="text-xs text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
              ` : ''}
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button 
                onclick="openProductModal('${p.id}')" 
                class="w-full py-2 px-3 text-xs font-medium rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
              >
                Detail Kondisi
              </button>
              
              ${isSold ? `
                <button 
                  disabled
                  class="w-full py-2 px-3 text-xs font-medium rounded-lg bg-zinc-200 text-zinc-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  Terjual
                </button>
              ` : `
                <button 
                  onclick="addToCart('${p.id}')" 
                  class="w-full py-2 px-3 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                >
                  <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                  + Keranjang
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function resetFilters() {
  state.category = 'all';
  state.grade = 'all';
  state.sortBy = 'default';
  state.searchQuery = '';
  
  if (DOM.searchInput) DOM.searchInput.value = '';
  if (DOM.sortSelect) DOM.sortSelect.value = 'default';

  document.querySelectorAll('.filter-pill-cat').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });
  document.querySelectorAll('.filter-pill-grade').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.grade === 'all');
  });

  applyFilters();
}

// Product Detail Modal
function openProductModal(productId) {
  const p = Store.getById(productId);
  if (!p) return;
  state.selectedProduct = p;

  const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';
  const isSold = !p.isAvailable;

  DOM.productModalContent.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: Images -->
      <div>
        <div class="aspect-square bg-zinc-100 rounded-xl overflow-hidden mb-3 border border-zinc-200 relative">
          <img id="mainModalImage" src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover ${isSold ? 'grayscale-[30%]' : ''}">
          ${isSold ? `
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span class="px-4 py-2 bg-red-600 text-white font-bold text-sm tracking-widest uppercase rounded-md shadow-lg">
                BARANG INI SUDAH TERJUAL
              </span>
            </div>
          ` : ''}
        </div>
        ${p.images.length > 1 ? `
          <div class="flex gap-2">
            ${p.images.map((img) => `
              <button onclick="document.getElementById('mainModalImage').src='${img}'" class="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-zinc-900 transition shrink-0">
                <img src="${img}" class="w-full h-full object-cover">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Right: Details & Full Transparency Report -->
      <div class="flex flex-col justify-between">
        <div>
          <!-- Header tags -->
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="text-xs uppercase font-medium px-2.5 py-1 rounded-full ${gradeClass}">
              ${p.grade} • ${p.gradeScore} (${p.gradeBadge})
            </span>
            <span class="text-xs text-zinc-400">${p.brand} • ${p.categoryLabel}</span>
            <span class="text-xs text-zinc-400">• ID: ${p.id}</span>
          </div>

          <h2 class="text-xl font-semibold text-zinc-900 mb-2 leading-snug">${p.name}</h2>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-2xl font-bold text-zinc-900">${formatRupiah(p.price)}</span>
            ${p.originalPrice > p.price ? `
              <span class="text-sm text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
              <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Hemat ${discount}%</span>
            ` : ''}
          </div>

          <p class="text-sm text-zinc-600 mb-6 leading-relaxed">${p.description}</p>

          <!-- Transparent Condition Checklist (titipjualsecond Standard) -->
          <div class="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 mb-6 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              Laporan Transparansi Kondisi (Authentic Check)
            </h4>
            
            <div class="grid grid-cols-1 gap-2 text-xs">
              <div class="flex items-start gap-2">
                <span class="text-zinc-400 font-medium w-24 shrink-0">Fisik Bodi:</span>
                <span class="text-zinc-800 font-medium">${p.conditionDetails.physical}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-zinc-400 font-medium w-24 shrink-0">Fungsi Teknis:</span>
                <span class="text-emerald-700 font-medium">${p.conditionDetails.function}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-zinc-400 font-medium w-24 shrink-0">Kelengkapan:</span>
                <span class="text-zinc-800">${p.conditionDetails.completeness}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-zinc-400 font-medium w-24 shrink-0">Catatan Minus:</span>
                <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">${p.conditionDetails.defect}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-zinc-400 font-medium w-24 shrink-0">Histori Asal:</span>
                <span class="text-zinc-600 italic">${p.conditionDetails.origin}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CTAs -->
        <div class="space-y-2 pt-4 border-t border-zinc-100">
          ${isSold ? `
            <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <p class="text-xs font-semibold text-red-700">Barang ini sudah terjual ke pembeli lain.</p>
              <p class="text-[11px] text-red-500 mt-0.5">Pantau katalog secara berkala untuk update drop selanjutnya.</p>
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-3">
              <button 
                onclick="addToCart('${p.id}'); closeProductModal();" 
                class="w-full py-3 px-4 rounded-xl border border-zinc-900 text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition flex items-center justify-center gap-2"
              >
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                + Keranjang
              </button>
              <button 
                onclick="buyDirectWhatsApp('${p.id}')" 
                class="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition flex items-center justify-center gap-2"
              >
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                Beli via WhatsApp
              </button>
            </div>
            <p class="text-center text-[11px] text-zinc-400">Garansi retur 48 jam jika kondisi fisik tidak sesuai transparansi di atas.</p>
          `}
        </div>
      </div>
    </div>
  `;

  DOM.productModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function closeProductModal() {
  DOM.productModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Direct Buy via WhatsApp
function buyDirectWhatsApp(productId) {
  const p = Store.getById(productId);
  if (!p) return;

  const phone = "6281234567890"; // WhatsApp admin titipjualsecond
  const text = `Halo Admin titipjualsecond,%0A%0ASaya berminat membeli barang second ini:%0A• *Nama Barang:* ${encodeURIComponent(p.name)}%0A• *Kondisi:* ${p.grade} (${p.gradeScore})%0A• *Harga:* ${formatRupiah(p.price)}%0A• *Kode ID:* ${p.id}%0A%0AApakah unit masih tersedia dan siap dikirim? Terima kasih!`;
  
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// Checkout Modal (Multi-item WhatsApp)
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Keranjang Anda masih kosong.');
    return;
  }
  closeCartDrawer();
  DOM.checkoutModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeCheckoutModal() {
  DOM.checkoutModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const courier = document.getElementById('custCourier').value;
  const notes = document.getElementById('custNotes').value.trim();

  let subtotal = 0;
  let itemsListText = '';

  state.cart.forEach((item, idx) => {
    subtotal += item.price;
    itemsListText += `${idx + 1}. ${item.name} (${item.grade}) - ${formatRupiah(item.price)}%0A`;
  });

  const invoiceNumber = `TJS-${Math.floor(10000 + Math.random() * 90000)}`;
  const waNumber = "6281234567890";

  let message = `*FORMAT PESANAN TITIPJUALSECOND*%0A`;
  message += `No. Invoice: *#${invoiceNumber}*%0A%0A`;
  message += `*Daftar Barang:*%0A${itemsListText}%0A`;
  message += `*Total Pembayaran:* ${formatRupiah(subtotal)}%0A%0A`;
  message += `*Data Pengiriman:*%0A`;
  message += `• Nama: ${encodeURIComponent(name)}%0A`;
  message += `• No. WA: ${encodeURIComponent(phone)}%0A`;
  message += `• Ekspedisi: ${encodeURIComponent(courier)}%0A`;
  message += `• Alamat: ${encodeURIComponent(address)}%0A`;
  if (notes) message += `• Catatan: ${encodeURIComponent(notes)}%0A`;
  message += `%0AMohon konfirmasi total beserta nomor rekening pembayaran. Terima kasih!`;

  state.cart = [];
  saveCart();
  closeCheckoutModal();
  showToast('Pesanan dibuat! Membuka WhatsApp...');

  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// Consignment Modal
function openConsignmentModal() {
  DOM.consignmentModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeConsignmentModal() {
  DOM.consignmentModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function handleConsignmentSubmit(e) {
  e.preventDefault();
  const itemName = document.getElementById('consignItemName').value;
  const itemCategory = document.getElementById('consignCategory').value;
  const expectedPrice = document.getElementById('consignExpectedPrice').value;
  const consignNotes = document.getElementById('consignNotes').value;

  const waNumber = "6281234567890";
  let message = `*PENGAJUAN TITIP JUAL KE TITIPJUALSECOND*%0A%0A`;
  message += `• Nama Barang: ${encodeURIComponent(itemName)}%0A`;
  message += `• Kategori: ${encodeURIComponent(itemCategory)}%0A`;
  message += `• Ekspektasi Harga: Rp ${encodeURIComponent(expectedPrice)}%0A`;
  message += `• Kondisi & Catatan: ${encodeURIComponent(consignNotes)}%0A%0A`;
  message += `Mohon review kurasi tim titipjualsecond. Foto barang akan saya kirimkan di sini.`;

  closeConsignmentModal();
  showToast('Form terkirim! Silakan kirimkan foto barang via WhatsApp.');
  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// Event Listeners
function initEventListeners() {
  // Category Pill Filters
  document.querySelectorAll('.filter-pill-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.category;
      applyFilters();
    });
  });

  // Grade Pill Filters
  document.querySelectorAll('.filter-pill-grade').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill-grade').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.grade = btn.dataset.grade;
      applyFilters();
    });
  });

  // Search Input
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Sort Select
  if (DOM.sortSelect) {
    DOM.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFilters();
    });
  }

  // Checkout Form
  if (DOM.checkoutForm) {
    DOM.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  // Consignment Form
  if (DOM.consignmentForm) {
    DOM.consignmentForm.addEventListener('submit', handleConsignmentSubmit);
  }

  // Modal Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeCheckoutModal();
      closeConsignmentModal();
    }
  });

  // Live Sync with Admin CMS
  window.addEventListener('titipjualsecond:updated', () => {
    loadProducts();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'titipjualsecond_products') {
      loadProducts();
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartBadge();
  updateWishlistBadge();
  initEventListeners();
});
