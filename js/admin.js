/**
 * TitipLaku - Admin CMS Logic & Realtime Order Notification
 */

const AdminState = {
  products: [],
  orders: [],
  currentTab: 'inventory',
  searchQuery: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  currentUploadedImage: null
};

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function showAdminToast(message) {
  const toast = document.getElementById('adminToast');
  const msg = document.getElementById('adminToastMessage');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('toast-animate');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-animate');
  }, 2800);
}

// ==================== 1. SECURITY & AUTH ====================
function checkSecurity() {
  const isAuth = Store.isAdminLoggedIn();
  const lockScreen = document.getElementById('adminLockScreen');
  const dashboard = document.getElementById('adminDashboard');

  if (isAuth) {
    if (lockScreen) lockScreen.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    loadAdminData();
    initRealtimeOrderListeners();
  } else {
    if (lockScreen) lockScreen.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    document.getElementById('gatePasswordInput')?.focus();
  }
}

function handleDirectAdminLogin(e) {
  e.preventDefault();
  const pin = document.getElementById('gatePasswordInput').value;
  if (Store.loginAdmin(pin)) {
    checkSecurity();
    showAdminToast('Selamat datang di CMS TitipLaku!');
  } else {
    alert('Password Admin Salah! Akses ditolak.');
    document.getElementById('gatePasswordInput').value = '';
    document.getElementById('gatePasswordInput').focus();
  }
}

function handleAdminLogout() {
  Store.logoutAdmin();
  checkSecurity();
}

// ==================== 2. TABS SWITCHER ====================
function switchTab(tabName) {
  AdminState.currentTab = tabName;
  const secInv = document.getElementById('sectionInventory');
  const secOrd = document.getElementById('sectionOrders');
  const btnInv = document.getElementById('tabBtnInventory');
  const btnOrd = document.getElementById('tabBtnOrders');

  if (tabName === 'inventory') {
    secInv.classList.remove('hidden');
    secOrd.classList.add('hidden');
    btnInv.className = "py-3 text-xs font-bold uppercase tracking-wider text-[#14453D] border-b-2 border-[#14453D] flex items-center gap-2";
    btnOrd.className = "py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-[#14453D] border-b-2 border-transparent flex items-center gap-2 transition";
  } else {
    secInv.classList.add('hidden');
    secOrd.classList.remove('hidden');
    btnOrd.className = "py-3 text-xs font-bold uppercase tracking-wider text-[#14453D] border-b-2 border-[#14453D] flex items-center gap-2";
    btnInv.className = "py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-[#14453D] border-b-2 border-transparent flex items-center gap-2 transition";
    renderOrders();
  }
}

// ==================== 3. DATA LOADING & INVENTORY ====================
function loadAdminData() {
  AdminState.products = Store.getAll();
  AdminState.orders = Store.getOrders();
  renderAdminTable();
  updateStats();
  updateOrderBadge();
}

function updateStats() {
  const total = AdminState.products.length;
  const active = AdminState.products.filter(p => p.isAvailable).length;
  const sold = total - active;
  
  const totalValue = AdminState.products
    .filter(p => p.isAvailable)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  document.getElementById('statTotalItems').textContent = total;
  document.getElementById('statActiveItems').textContent = active;
  document.getElementById('statSoldItems').textContent = sold;
  document.getElementById('statTotalValue').textContent = formatRupiah(totalValue);
}

function updateOrderBadge() {
  const count = AdminState.orders.length;
  const badge = document.getElementById('orderBadgeCounter');
  const tabBadge = document.getElementById('tabOrderCount');
  const totalBadge = document.getElementById('ordersTotalBadge');

  if (tabBadge) tabBadge.textContent = count;
  if (totalBadge) totalBadge.textContent = `${count} Pesanan`;

  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const empty = document.getElementById('adminEmptyState');
  if (!tbody) return;

  let list = [...AdminState.products];

  if (AdminState.searchQuery.trim()) {
    const q = AdminState.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.sellerLocation || '').toLowerCase().includes(q)
    );
  }

  if (AdminState.statusFilter === 'ready') list = list.filter(p => p.isAvailable);
  if (AdminState.statusFilter === 'sold') list = list.filter(p => !p.isAvailable);
  if (AdminState.categoryFilter !== 'all') list = list.filter(p => p.category === AdminState.categoryFilter);

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  tbody.innerHTML = list.map(p => {
    const isSold = !p.isAvailable;
    const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';

    return `
      <tr class="hover:bg-zinc-50/80 transition">
        <!-- Produk -->
        <td class="px-5 py-3.5">
          <div class="flex items-center gap-3">
            <img src="${p.images[0]}" alt="${p.name}" class="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0">
            <div class="min-w-0">
              <span class="text-[9px] font-mono text-zinc-400 block">${p.id}</span>
              <h4 class="font-bold text-xs text-zinc-900 line-clamp-1">${p.name}</h4>
              <p class="text-[11px] text-[#14453D] font-medium flex items-center gap-1">
                <span>📍 ${p.sellerLocation || 'UMKM Indonesia'}</span>
              </p>
            </div>
          </div>
        </td>

        <!-- Kategori -->
        <td class="px-4 py-3.5 whitespace-nowrap text-zinc-600 font-medium">
          ${p.categoryLabel}
        </td>

        <!-- Harga -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          <div class="font-bold text-xs text-[#14453D]">${formatRupiah(p.price)}</div>
        </td>

        <!-- Grade -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${gradeClass}">
            ${p.grade}
          </span>
        </td>

        <!-- Status -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${isSold ? `
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Habis / Terjual
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready
            </span>
          `}
        </td>

        <!-- Action -->
        <td class="px-4 py-3.5 whitespace-nowrap text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button 
              onclick="handleToggleStatus('${p.id}')"
              class="px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                isSold 
                  ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' 
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              } transition"
            >
              ${isSold ? 'Set Ready' : 'Set Terjual'}
            </button>

            <button onclick="openEditModal('${p.id}')" class="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition" title="Edit">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>

            <button onclick="handleDelete('${p.id}')" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

// ==================== 4. REALTIME ORDER NOTIFICATION POPUP ====================
function triggerSoundChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {}
}

function showRealtimeOrderPopup(order) {
  triggerSoundChime();
  const modal = document.getElementById('realtimeOrderModal');
  const container = document.getElementById('orderPopupContent');
  if (!modal || !container) return;

  const waUrl = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Halo%20kak%20${encodeURIComponent(order.customerName)},%20kami%20dari%20TitipLaku%20telah%20menerima%20pesanan%20invoice%20${order.orderId}.`;

  container.innerHTML = `
    <div class="space-y-3">
      <div class="bg-[#EBF5F3] border border-emerald-200 rounded-xl p-3.5">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="font-mono text-zinc-500 font-bold">#${order.orderId}</span>
          <span class="text-[10px] text-zinc-400">${new Date(order.createdAt).toLocaleTimeString('id-ID')} WIB</span>
        </div>
        <h4 class="text-sm font-extrabold text-[#14453D]">${order.customerName}</h4>
        <p class="text-xs text-zinc-700 mt-0.5 font-mono">📱 WhatsApp: ${order.customerPhone}</p>
        <p class="text-xs text-zinc-600 mt-1"><span class="text-zinc-500">Alamat:</span> ${order.customerAddress}</p>
        <p class="text-xs text-zinc-600"><span class="text-zinc-500">Ekspedisi:</span> ${order.courier}</p>
        ${order.notes ? `<p class="text-xs text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5"><span class="font-bold">Catatan:</span> ${order.notes}</p>` : ''}
      </div>

      <div>
        <h5 class="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Produk yang Dipesan:</h5>
        <div class="space-y-1.5 max-h-36 overflow-y-auto">
          ${order.items.map(it => `
            <div class="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded-lg border border-zinc-100">
              <div>
                <span class="font-bold text-zinc-900">${it.name}</span>
                <span class="text-[10px] text-zinc-400 block">${it.qty || 1} unit</span>
              </div>
              <span class="font-extrabold text-[#14453D]">${formatRupiah(it.price * (it.qty || 1))}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex justify-between items-baseline pt-2 border-t border-zinc-200">
        <span class="text-xs uppercase font-bold text-zinc-500">Total Pembayaran:</span>
        <span class="text-base font-extrabold text-[#14453D]">${formatRupiah(order.totalAmount)}</span>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="markItemsFromOrderSold('${order.orderId}')" class="py-2.5 px-3 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-700 transition">
          Tandai Terjual
        </button>
        <a href="${waUrl}" target="_blank" class="py-2.5 px-3 bg-[#F36926] hover:bg-[#E05615] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-xs">
          <i data-lucide="message-circle" class="w-4 h-4"></i>
          Chat WA Pembeli
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();
  loadAdminData();
}

function closeOrderPopup() {
  document.getElementById('realtimeOrderModal').classList.add('hidden');
}

function markItemsFromOrderSold(orderId) {
  const orders = Store.getOrders();
  const o = orders.find(x => x.orderId === orderId);
  if (!o) return;

  o.items.forEach(it => {
    const p = Store.getById(it.id);
    if (p && p.isAvailable) {
      Store.toggleStatus(it.id);
    }
  });

  Store.markOrderDone(orderId);
  showAdminToast(`Pesanan #${orderId} telah ditandai.`);
  closeOrderPopup();
  loadAdminData();
  renderOrders();
}

// ==================== 5. ORDERS QUEUE TAB ====================
function renderOrders() {
  const container = document.getElementById('ordersListContainer');
  const empty = document.getElementById('ordersEmptyState');
  if (!container) return;

  const orders = Store.getOrders();
  if (orders.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  container.innerHTML = orders.map(ord => {
    const waUrl = `https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Halo%20kak%20${encodeURIComponent(ord.customerName)},%20kami%20dari%20TitipLaku%20terkait%20pesanan%20${ord.orderId}.`;
    const isDone = ord.status.includes('SELESAI');

    return `
      <div class="border border-zinc-200 rounded-2xl p-5 bg-white hover:border-[#14453D] transition shadow-2xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-xs px-2.5 py-1 bg-[#EBF5F3] text-[#14453D] rounded-lg">#${ord.orderId}</span>
            <span class="text-xs text-zinc-400">${new Date(ord.createdAt).toLocaleString('id-ID')}</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isDone ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
            ${ord.status}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <h4 class="font-bold text-zinc-900 text-sm">${ord.customerName}</h4>
            <p class="text-zinc-600">📱 WhatsApp: <span class="font-mono font-medium">${ord.customerPhone}</span></p>
            <p class="text-zinc-600">📍 Alamat: ${ord.customerAddress}</p>
            <p class="text-zinc-600">🚚 Kurir: <span class="font-medium">${ord.courier}</span></p>
            ${ord.notes ? `<p class="text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1">Catatan: ${ord.notes}</p>` : ''}
          </div>

          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rincian Barang:</span>
            <div class="space-y-1">
              ${ord.items.map(it => `
                <div class="flex justify-between items-center text-xs">
                  <span>${it.name} (${it.qty || 1}x)</span>
                  <span class="font-bold text-[#14453D]">${formatRupiah(it.price * (it.qty || 1))}</span>
                </div>
              `).join('')}
            </div>
            <div class="pt-2 border-t border-zinc-100 flex justify-between items-baseline font-bold">
              <span>Total Pesanan:</span>
              <span class="text-sm text-[#14453D]">${formatRupiah(ord.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          ${!isDone ? `
            <button onclick="markItemsFromOrderSold('${ord.orderId}')" class="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition">
              Tandai Terjual
            </button>
          ` : ''}
          <a href="${waUrl}" target="_blank" class="px-3.5 py-1.5 bg-[#F36926] hover:bg-[#E05615] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            Chat WhatsApp
          </a>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// ==================== 6. MODAL & PRODUCT CRUD ====================
function openAddModal() {
  document.getElementById('editProductId').value = '';
  document.getElementById('formTitle').textContent = 'Posting Produk Baru';
  document.getElementById('formBadge').textContent = 'Katalog TitipLaku';
  document.getElementById('submitBtnText').textContent = 'Simpan & Posting Produk';
  document.getElementById('productForm').reset();
  
  AdminState.currentUploadedImage = null;
  const defImg = "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=300&auto=format&fit=crop";
  document.getElementById('imagePreview').src = defImg;
  document.getElementById('inputImageUrl').value = defImg;

  document.getElementById('productFormModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function openEditModal(productId) {
  const p = Store.getById(productId);
  if (!p) return;

  document.getElementById('editProductId').value = p.id;
  document.getElementById('formTitle').textContent = `Edit Produk: ${p.name}`;
  document.getElementById('formBadge').textContent = `Mengedit ${p.id}`;
  document.getElementById('submitBtnText').textContent = 'Perbarui Produk';

  document.getElementById('inputName').value = p.name || '';
  document.getElementById('inputBrand').value = p.brand || '';
  document.getElementById('inputSellerLocation').value = p.sellerLocation || '';
  document.getElementById('inputCategory').value = p.category || 'kuliner';
  document.getElementById('inputPrice').value = p.price || '';
  document.getElementById('inputOriginalPrice').value = p.originalPrice || '';
  document.getElementById('inputSize').value = p.size || '';
  document.getElementById('inputStatus').value = p.isAvailable ? 'true' : 'false';

  const imgUrl = (p.images && p.images[0]) ? p.images[0] : '';
  document.getElementById('inputImageUrl').value = imgUrl;
  document.getElementById('imagePreview').src = imgUrl;
  AdminState.currentUploadedImage = null;

  const cd = p.conditionDetails || {};
  document.getElementById('inputPhysical').value = cd.physical || '';
  document.getElementById('inputFunction').value = cd.function || '';
  document.getElementById('inputDescription').value = p.description || '';

  document.getElementById('productFormModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function closeFormModal() {
  document.getElementById('productFormModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function updateImagePreview(url) {
  if (url && url.trim()) document.getElementById('imagePreview').src = url.trim();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    AdminState.currentUploadedImage = base64;
    document.getElementById('imagePreview').src = base64;
    document.getElementById('inputImageUrl').value = '';
    showAdminToast('Foto produk berhasil dimuat!');
  };
  reader.readAsDataURL(file);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editProductId').value;
  const imageUrlInput = document.getElementById('inputImageUrl').value.trim();
  const finalImage = AdminState.currentUploadedImage || imageUrlInput || 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=600&auto=format&fit=crop';

  const productData = {
    name: document.getElementById('inputName').value,
    brand: document.getElementById('inputBrand').value,
    sellerLocation: document.getElementById('inputSellerLocation').value || 'UMKM Indonesia',
    category: document.getElementById('inputCategory').value,
    price: document.getElementById('inputPrice').value,
    originalPrice: document.getElementById('inputOriginalPrice').value || document.getElementById('inputPrice').value,
    size: document.getElementById('inputSize').value,
    isAvailable: document.getElementById('inputStatus').value === 'true',
    images: [finalImage],
    conditionPhysical: document.getElementById('inputPhysical').value || 'Kondisi fisik terawat.',
    conditionFunction: document.getElementById('inputFunction').value || '100% Berfungsi normal.',
    conditionCompleteness: 'Unit sesuai foto dan deskripsi.',
    defect: 'Tidak ada defect.',
    conditionOrigin: document.getElementById('inputSellerLocation').value || 'Konsinyasi TitipLaku.',
    description: document.getElementById('inputDescription').value || 'Produk titip jual berkualitas di TitipLaku.'
  };

  if (editId) {
    Store.update(editId, productData);
    showAdminToast(`Produk #${editId} berhasil diperbarui!`);
  } else {
    const created = Store.add(productData);
    showAdminToast(`Produk baru #${created.id} diposting ke katalog!`);
  }

  closeFormModal();
  loadAdminData();
}

function handleToggleStatus(productId) {
  const updated = Store.toggleStatus(productId);
  if (updated) {
    const statusText = updated.isAvailable ? 'READY' : 'TERJUAL / HABIS';
    showAdminToast(`Status diubah: ${statusText}`);
    loadAdminData();
  }
}

function handleDelete(productId) {
  if (confirm(`Apakah Anda yakin ingin menghapus produk #${productId}?`)) {
    Store.remove(productId);
    showAdminToast(`Produk #${productId} dihapus.`);
    loadAdminData();
  }
}

function handleResetData() {
  if (confirm('Kembalikan katalog ke data sampel awal TitipLaku?')) {
    Store.reset();
    showAdminToast('Katalog direset ke sampel awal.');
    loadAdminData();
  }
}

// ==================== 7. EVENT LISTENERS ====================
function initRealtimeOrderListeners() {
  window.addEventListener('titiplaku:new_order', (e) => {
    showRealtimeOrderPopup(e.detail);
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'titiplaku_latest_order' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        const orders = Store.getOrders();
        const found = orders.find(o => o.orderId === payload.orderId);
        if (found) {
          showRealtimeOrderPopup(found);
        }
      } catch (err) {}
    }
    if (e.key === 'titiplaku_products') {
      loadAdminData();
    }
  });
}

function initAdminEvents() {
  document.getElementById('adminSearchInput')?.addEventListener('input', (e) => {
    AdminState.searchQuery = e.target.value;
    renderAdminTable();
  });

  document.getElementById('adminStatusFilter')?.addEventListener('change', (e) => {
    AdminState.statusFilter = e.target.value;
    renderAdminTable();
  });

  document.getElementById('adminCatFilter')?.addEventListener('change', (e) => {
    AdminState.categoryFilter = e.target.value;
    renderAdminTable();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFormModal();
      closeOrderPopup();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkSecurity();
  initAdminEvents();
});
