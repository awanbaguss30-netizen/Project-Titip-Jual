/**
 * TitipLaku - Modern Indonesian UMKM & Consignment Engine
 */

const state = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('titiplaku_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('titiplaku_wishlist') || '[]'),
  
  category: 'all',
  searchQuery: '',
  selectedProduct: null
};

// Formatter Rupiah
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

// Load Storefront
function loadStorefront() {
  state.products = Store.getAll();
  applyFilters();
  updateCartBadge();
  updateWishlistBadge();
}

// Category Filter
function setCategoryFilter(cat) {
  state.category = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    const isAct = btn.dataset.cat === cat;
    btn.classList.toggle('active', isAct);
    btn.classList.toggle('bg-[#14453D]', isAct);
    btn.classList.toggle('text-white', isAct);
    btn.classList.toggle('bg-white', !isAct);
    btn.classList.toggle('text-zinc-700', !isAct);
  });

  const titles = {
    'all': 'Produk UMKM & Titip Jual Terbaru',
    'kuliner': 'Kuliner & Camilan UMKM Tradisional',
    'kerajinan': 'Kerajinan Tangan Anyaman Lokal',
    'clothing': 'Pakaian & Fashion Vintage',
    'footwear': 'Sepatu & Sneakers Pilihan',
    'gadgets': 'Kamera Analog & Gadget Pilihan'
  };

  const headerTitle = document.getElementById('catalogHeaderTitle');
  if (headerTitle) headerTitle.textContent = titles[cat] || 'Koleksi TitipLaku';

  applyFilters();
}

// Search & Filter
function applyFilters() {
  let list = [...state.products];

  // Category
  if (state.category !== 'all') {
    list = list.filter(p => p.category === state.category);
  }

  // Search
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  if (q) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.sellerLocation || '').toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  state.filteredProducts = list;
  renderProducts();
}

// Render Products Matching the Laptop & Phone Mockups
function renderProducts() {
  const container = document.getElementById('productGrid');
  const countEl = document.getElementById('productCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `Menampilkan ${state.filteredProducts.length} produk titip pilihan`;
  }

  if (state.filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <i data-lucide="package-search" class="w-12 h-12 mx-auto text-zinc-300 mb-2"></i>
        <h4 class="text-sm font-bold text-zinc-800 mb-1">Produk tidak ditemukan</h4>
        <p class="text-xs text-zinc-400 mb-4">Coba cari dengan kata kunci lain atau pilih semua kategori.</p>
        <button onclick="setCategoryFilter('all')" class="text-xs font-bold px-4 py-2 bg-[#14453D] text-white rounded-full">
          Lihat Semua Produk
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = state.filteredProducts.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const isSold = !p.isAvailable;
    const location = p.sellerLocation || 'UMKM Indonesia';
    const rating = p.rating || 5.0;
    const reviewCount = p.reviewCount || 45;

    return `
      <div class="titiplaku-card bg-white border border-zinc-200 shadow-xs flex flex-col group cursor-pointer" onclick="openProductModal('${p.id}')">
        
        <!-- Image Container with Heart Button -->
        <div class="titiplaku-card-img-wrap">
          <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover ${isSold ? 'grayscale-[40%]' : ''}">
          
          <!-- Top Left Tag -->
          <div class="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            ${isSold ? `
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                TERJUAL
              </span>
            ` : `
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14453D] text-white shadow-xs flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Bisa Titip
              </span>
            `}
          </div>

          <!-- Top Right Heart Button -->
          <button 
            onclick="event.stopPropagation(); toggleWishlist('${p.id}')"
            class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-zinc-600 hover:text-red-500 shadow-sm transition z-10"
            title="Simpan Produk"
          >
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}"></i>
          </button>
        </div>

        <!-- Card Content -->
        <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <!-- Seller Location Badge (Matching Mockup: 📍 UMKM Bandung / Yogya) -->
            <div class="flex items-center gap-1 text-[11px] font-semibold text-[#14453D] mb-1">
              <i data-lucide="map-pin" class="w-3 h-3 text-[#F36926]"></i>
              <span class="line-clamp-1">${location}</span>
            </div>

            <!-- Product Title -->
            <h3 class="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 group-hover:text-[#F36926] transition leading-snug">
              ${p.name}
            </h3>

            <!-- Stars & Rating (Matching Mockup) -->
            <div class="flex items-center gap-1 mt-1.5 text-[11px] text-amber-500">
              <span class="font-bold">★ ${rating.toFixed(1)}</span>
              <span class="text-zinc-400 text-[10px]">(${reviewCount})</span>
              <span class="text-zinc-300">•</span>
              <span class="text-zinc-500 text-[10px]">${p.categoryLabel}</span>
            </div>
          </div>

          <!-- Price & Beli Button Row -->
          <div class="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <span class="text-xs sm:text-sm font-extrabold text-[#14453D] block">
                ${formatRupiah(p.price)}
              </span>
              ${p.originalPrice > p.price ? `
                <span class="text-[10px] text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
              ` : ''}
            </div>

            <!-- Action Button -->
            ${isSold ? `
              <span class="px-3 py-1 bg-zinc-100 text-zinc-400 font-bold text-xs rounded-full cursor-not-allowed">
                Habis
              </span>
            ` : `
              <button 
                onclick="event.stopPropagation(); addToCart('${p.id}')"
                class="px-3 py-1.5 bg-[#14453D] hover:bg-[#F36926] text-white font-bold text-xs rounded-full transition shadow-2xs flex items-center gap-1"
              >
                <span>Beli</span>
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            `}
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
    showToast(`"${product.name.substring(0, 20)}..." disimpan`);
  } else {
    state.wishlist.splice(index, 1);
    showToast(`Dihapus dari simpanan`);
  }
  localStorage.setItem('titiplaku_wishlist', JSON.stringify(state.wishlist));
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

// Cart Operations
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  if (!product.isAvailable) {
    showToast('Maaf, produk ini sedang kosong/terjual.');
    return;
  }

  const existing = state.cart.find(i => i.id === productId);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
    showToast(`Jumlah ${product.name.substring(0, 20)} ditambah`);
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      grade: product.grade,
      size: product.size,
      qty: 1
    });
    showToast('Produk dimasukkan ke keranjang');
  }

  saveCart();
  openCartDrawer();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  showToast('Produk dihapus dari keranjang');
}

function saveCart() {
  localStorage.setItem('titiplaku_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    const c = state.cart.reduce((sum, it) => sum + (it.qty || 1), 0);
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
    const itemTotal = item.price * (item.qty || 1);
    subtotal += itemTotal;
    return `
      <div class="flex gap-3 py-3.5 items-start">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl border border-zinc-200 shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-zinc-900 line-clamp-1">${item.name}</h4>
          <p class="text-[11px] text-zinc-500 mt-0.5">${item.size || 'Standar'} • ${item.qty || 1}x</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-extrabold text-[#14453D]">${formatRupiah(itemTotal)}</span>
            <button onclick="removeFromCart('${item.id}')" class="text-[11px] text-red-500 hover:text-red-700 font-semibold">
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

  document.getElementById('productModalContent').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- Image Gallery -->
      <div>
        <div class="aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 relative mb-3">
          <img id="modalMainImg" src="${p.images[0]}" class="w-full h-full object-cover ${isSold ? 'grayscale-[30%]' : ''}">
          ${isSold ? `
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span class="px-4 py-2 bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg shadow-lg">
                BARANG INI SUDAH TERJUAL
              </span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Detail Info -->
      <div class="flex flex-col justify-between h-full">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold text-[#14453D] mb-1">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-[#F36926]"></i>
            <span>${p.sellerLocation || 'UMKM Indonesia'}</span>
            <span class="text-zinc-300">•</span>
            <span class="text-zinc-500">${p.categoryLabel}</span>
          </div>

          <h2 class="text-xl font-extrabold text-zinc-900 mb-2 font-brand">${p.name}</h2>
          
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5F3] text-[#14453D]">
              ★ ${p.rating || 5.0} (${p.reviewCount || 45} Ulasan)
            </span>
            <span class="text-xs text-zinc-400">Kode: ${p.id}</span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 pb-4 mb-4 border-b border-zinc-100">
            <span class="text-2xl font-extrabold text-[#14453D]">${formatRupiah(p.price)}</span>
            ${p.originalPrice > p.price ? `
              <span class="text-sm text-zinc-400 line-through">${formatRupiah(p.originalPrice)}</span>
              <span class="text-xs font-bold text-[#F36926]">Diskon ${discount}%</span>
            ` : ''}
          </div>

          <p class="text-xs text-zinc-600 leading-relaxed mb-4">${p.description}</p>

          <!-- Transparency Report -->
          <div class="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 mb-5 space-y-2 text-xs">
            <h4 class="font-bold text-[#14453D] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              Jaminan Mutu & Transparansi TitipLaku
            </h4>
            <div class="space-y-1 text-zinc-600 text-[11px]">
              <div><span class="font-semibold text-zinc-800">Kondisi Fisik:</span> ${p.conditionDetails.physical}</div>
              <div><span class="font-semibold text-zinc-800">Fungsi / Kelayakan:</span> ${p.conditionDetails.function}</div>
              <div><span class="font-semibold text-zinc-800">Kelengkapan:</span> ${p.conditionDetails.completeness}</div>
              <div><span class="font-semibold text-zinc-800">Asal Konsinyasi:</span> ${p.conditionDetails.origin}</div>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div>
          ${isSold ? `
            <div class="p-3 bg-red-50 border border-red-200 text-center rounded-xl text-xs font-bold text-red-700">
              Produk ini sedang kosong atau sudah terjual.
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-3">
              <button onclick="addToCart('${p.id}'); closeProductModal();" class="py-3 px-4 border border-[#14453D] text-[#14453D] font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition rounded-xl flex items-center justify-center gap-1.5">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                + Keranjang
              </button>
              <button onclick="buyNowSingle('${p.id}')" class="py-3 px-4 bg-[#F36926] hover:bg-[#E05615] text-white font-bold text-xs uppercase tracking-wider transition rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                Beli Sekarang
              </button>
            </div>
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
    showToast('Keranjang belanja Anda masih kosong.');
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

// Buyer Checkout (Memicu Notifikasi Real-time di Admin CMS!)
function handleBuyerCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const courier = document.getElementById('custCourier').value;
  const notes = document.getElementById('custNotes').value.trim();

  let subtotal = 0;
  const items = state.cart.map(item => {
    const itemTotal = item.price * (item.qty || 1);
    subtotal += itemTotal;
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty || 1
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
    waItems += `${idx + 1}. ${it.name} (${it.qty}x) - ${formatRupiah(it.price * it.qty)}%0A`;
  });

  const waNumber = "6281234567890";
  let message = `*PESANAN TITIPLAKU*%0A`;
  message += `Invoice: *#${order.orderId}*%0A%0A`;
  message += `*Daftar Pesanan:*%0A${waItems}%0A`;
  message += `*Total Pembayaran:* ${formatRupiah(subtotal)}%0A%0A`;
  message += `*Data Pengiriman:*%0A`;
  message += `• Nama: ${encodeURIComponent(name)}%0A`;
  message += `• WhatsApp: ${encodeURIComponent(phone)}%0A`;
  message += `• Alamat: ${encodeURIComponent(address)}%0A`;
  message += `• Ekspedisi: ${encodeURIComponent(courier)}%0A`;
  if (notes) message += `• Catatan: ${encodeURIComponent(notes)}%0A`;
  message += `%0AMohon info nomor rekening pembayaran dan konfirmasi stok. Terima kasih!`;

  state.cart = [];
  saveCart();
  closeCheckoutModal();
  showToast('Pesanan berhasil dibuat! Menghubungkan ke admin via WhatsApp...');

  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// Titip Jual (Konsinyasi) Modal
function openConsignmentModal() {
  document.getElementById('consignmentModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeConsignmentModal() {
  document.getElementById('consignmentModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function handleConsignmentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('consignName').value;
  const category = document.getElementById('consignCat').value;
  const price = document.getElementById('consignPrice').value;
  const origin = document.getElementById('consignOrigin').value;
  const desc = document.getElementById('consignDesc').value;

  const waNumber = "6281234567890";
  let message = `*PENGAJUAN TITIP JUAL / KONSINYASI TITIPLAKU*%0A%0A`;
  message += `• Nama Produk/Barang: ${encodeURIComponent(name)}%0A`;
  message += `• Kategori: ${encodeURIComponent(category)}%0A`;
  message += `• Ekspektasi Harga: Rp ${encodeURIComponent(price)}%0A`;
  message += `• Lokasi/Asal UMKM: ${encodeURIComponent(origin)}%0A`;
  message += `• Keterangan & Deskripsi: ${encodeURIComponent(desc)}%0A%0A`;
  message += `Halo Admin TitipLaku, saya ingin menitipkan produk di atas. Foto produk akan saya kirimkan di chat ini.`;

  closeConsignmentModal();
  showToast('Form terkirim! Silakan kirimkan foto produk via WhatsApp.');
  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// Admin Security Gate
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
    }, 500);
  } else {
    alert('Password Admin Salah! Akses ditolak.');
    document.getElementById('adminPinInput').value = '';
    document.getElementById('adminPinInput').focus();
  }
}

// Event Listeners
function initEvents() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') applyFilters();
    });
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeCheckoutModal();
      closeConsignmentModal();
      closeAuthModal();
    }
  });

  window.addEventListener('titiplaku:updated', () => {
    state.products = Store.getAll();
    applyFilters();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadStorefront();
  initEvents();
});
