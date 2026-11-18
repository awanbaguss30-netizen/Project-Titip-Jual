/**
 * titipjualsecond - Admin CMS Logic
 * Pengelolaan inventaris, posting barang baru, edit transparansi, dan status terjual
 */

const AdminState = {
  products: [],
  searchQuery: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  currentUploadedImage: null
};

// Formatter
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Admin Toast
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

// Load and Render Table
function loadAdminData() {
  AdminState.products = Store.getAll();
  renderAdminTable();
  updateStats();
}

// Update Top Stat Cards
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

// Render Table Rows
function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const emptyState = document.getElementById('adminEmptyState');
  if (!tbody) return;

  let list = [...AdminState.products];

  // Search Filter
  if (AdminState.searchQuery.trim()) {
    const q = AdminState.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  // Status Filter
  if (AdminState.statusFilter === 'ready') {
    list = list.filter(p => p.isAvailable);
  } else if (AdminState.statusFilter === 'sold') {
    list = list.filter(p => !p.isAvailable);
  }

  // Category Filter
  if (AdminState.categoryFilter !== 'all') {
    list = list.filter(p => p.category === AdminState.categoryFilter);
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = list.map(p => {
    const isSold = !p.isAvailable;
    const gradeClass = p.grade === 'Grade S' ? 'badge-grade-s' : p.grade === 'Grade A' ? 'badge-grade-a' : 'badge-grade-b';
    const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

    return `
      <tr class="hover:bg-zinc-50/80 transition">
        <!-- Produk & Gambar -->
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <img src="${p.images[0]}" alt="${p.name}" class="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-50">
            <div class="min-w-0">
              <span class="text-[10px] font-mono text-zinc-400 block">${p.id}</span>
              <h4 class="font-medium text-xs text-zinc-900 line-clamp-1">${p.name}</h4>
              <p class="text-[11px] text-zinc-400">${p.brand} • ${p.size || 'Standar'}</p>
            </div>
          </div>
        </td>

        <!-- Kategori -->
        <td class="px-4 py-4 whitespace-nowrap">
          <span class="text-xs text-zinc-600">${p.categoryLabel}</span>
        </td>

        <!-- Harga & Diskon -->
        <td class="px-4 py-4 whitespace-nowrap">
          <div class="font-semibold text-xs text-zinc-900">${formatRupiah(p.price)}</div>
          ${p.originalPrice > p.price ? `
            <div class="text-[10px] text-zinc-400 line-through">${formatRupiah(p.originalPrice)} (${discount}% off)</div>
          ` : ''}
        </td>

        <!-- Grade Kondisi -->
        <td class="px-4 py-4 whitespace-nowrap">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${gradeClass}">
            ${p.grade} • ${p.gradeScore}
          </span>
          <span class="text-[10px] text-zinc-400 block mt-0.5">${p.gradeBadge}</span>
        </td>

        <!-- Status Stok -->
        <td class="px-4 py-4 whitespace-nowrap">
          ${isSold ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Terjual (Sold)
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Tersedia (Ready)
            </span>
          `}
        </td>

        <!-- Aksi -->
        <td class="px-4 py-4 whitespace-nowrap text-right">
          <div class="flex items-center justify-end gap-1.5">
            <!-- Toggle Sold / Ready -->
            <button 
              onclick="handleToggleStatus('${p.id}')"
              class="px-2.5 py-1 text-[11px] font-medium rounded-md border ${
                isSold 
                  ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50'
              } transition"
              title="${isSold ? 'Tandai Ready Kembali' : 'Tandai Sudah Terjual'}"
            >
              ${isSold ? 'Set Ready' : 'Set Terjual'}
            </button>

            <!-- Edit Button -->
            <button 
              onclick="openEditModal('${p.id}')"
              class="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition"
              title="Edit Rincian Barang"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>

            <!-- Delete Button -->
            <button 
              onclick="handleDelete('${p.id}')"
              class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
              title="Hapus Barang"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

// Open Add Modal
function openAddModal() {
  document.getElementById('editProductId').value = '';
  document.getElementById('formTitle').textContent = 'Posting Barang Second Baru';
  document.getElementById('formBadge').textContent = 'Tambah Barang Baru';
  document.getElementById('submitBtnText').textContent = 'Simpan & Posting Barang';
  document.getElementById('productForm').reset();
  
  AdminState.currentUploadedImage = null;
  const defaultImg = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=300&auto=format&fit=crop";
  document.getElementById('imagePreview').src = defaultImg;
  document.getElementById('inputImageUrl').value = defaultImg;
  document.getElementById('inputGradeScore').value = '95%';

  document.getElementById('productFormModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

// Open Edit Modal
function openEditModal(productId) {
  const p = Store.getById(productId);
  if (!p) return;

  document.getElementById('editProductId').value = p.id;
  document.getElementById('formTitle').textContent = `Edit Rincian: ${p.name}`;
  document.getElementById('formBadge').textContent = `Mengedit ${p.id}`;
  document.getElementById('submitBtnText').textContent = 'Perbarui Rincian Barang';

  // Fill Basic Inputs
  document.getElementById('inputName').value = p.name || '';
  document.getElementById('inputBrand').value = p.brand || '';
  document.getElementById('inputCategory').value = p.category || 'gadgets';
  document.getElementById('inputPrice').value = p.price || '';
  document.getElementById('inputOriginalPrice').value = p.originalPrice || '';
  document.getElementById('inputSize').value = p.size || '';
  document.getElementById('inputStatus').value = p.isAvailable ? 'true' : 'false';

  // Fill Grade Inputs
  document.getElementById('inputGrade').value = p.grade || 'Grade A';
  document.getElementById('inputGradeScore').value = p.gradeScore || '95%';

  // Fill Image
  const imgUrl = (p.images && p.images[0]) ? p.images[0] : '';
  document.getElementById('inputImageUrl').value = imgUrl;
  document.getElementById('imagePreview').src = imgUrl;
  AdminState.currentUploadedImage = null;

  // Fill Transparency
  const cd = p.conditionDetails || {};
  document.getElementById('inputPhysical').value = cd.physical || '';
  document.getElementById('inputFunction').value = cd.function || '';
  document.getElementById('inputCompleteness').value = cd.completeness || '';
  document.getElementById('inputDefect').value = cd.defect || '';
  document.getElementById('inputOrigin').value = cd.origin || '';
  document.getElementById('inputDescription').value = p.description || '';

  document.getElementById('productFormModal').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

// Close Modal
function closeFormModal() {
  document.getElementById('productFormModal').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Image Preview & File Upload
function updateImagePreview(url) {
  if (url && url.trim()) {
    document.getElementById('imagePreview').src = url.trim();
  }
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
    showAdminToast('Foto lokal berhasil dimuat!');
  };
  reader.readAsDataURL(file);
}

// Form Submit Handler
function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editProductId').value;
  const imageUrlInput = document.getElementById('inputImageUrl').value.trim();
  const finalImage = AdminState.currentUploadedImage || imageUrlInput || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop';

  const productData = {
    name: document.getElementById('inputName').value,
    brand: document.getElementById('inputBrand').value,
    category: document.getElementById('inputCategory').value,
    price: document.getElementById('inputPrice').value,
    originalPrice: document.getElementById('inputOriginalPrice').value || document.getElementById('inputPrice').value,
    size: document.getElementById('inputSize').value,
    isAvailable: document.getElementById('inputStatus').value === 'true',
    grade: document.getElementById('inputGrade').value,
    gradeScore: document.getElementById('inputGradeScore').value || '95%',
    images: [finalImage],
    conditionPhysical: document.getElementById('inputPhysical').value || 'Kondisi fisik terawat.',
    conditionFunction: document.getElementById('inputFunction').value || '100% Berfungsi normal.',
    conditionCompleteness: document.getElementById('inputCompleteness').value || 'Unit lengkap sesuai foto.',
    conditionDefect: document.getElementById('inputDefect').value || 'Minus wajar pemakaian second.',
    conditionOrigin: document.getElementById('inputOrigin').value || 'Titip jual terverifikasi.',
    description: document.getElementById('inputDescription').value || 'Barang second berkualitas di titipjualsecond.'
  };

  if (editId) {
    Store.update(editId, productData);
    showAdminToast(`Barang #${editId} berhasil diperbarui!`);
  } else {
    const created = Store.add(productData);
    showAdminToast(`Barang baru #${created.id} berhasil diposting ke katalog!`);
  }

  closeFormModal();
  loadAdminData();
}

// Toggle Status
function handleToggleStatus(productId) {
  const updated = Store.toggleStatus(productId);
  if (updated) {
    const statusText = updated.isAvailable ? 'READY (Tersedia)' : 'TERJUAL (Sold Out)';
    showAdminToast(`Status barang diubah menjadi: ${statusText}`);
    loadAdminData();
  }
}

// Delete
function handleDelete(productId) {
  if (confirm(`Apakah Anda yakin ingin menghapus barang #${productId} dari katalog?`)) {
    Store.remove(productId);
    showAdminToast(`Barang #${productId} dihapus.`);
    loadAdminData();
  }
}

// Reset
function handleResetData() {
  if (confirm('Kembalikan inventaris ke data sampel bawaan titipjualsecond?')) {
    Store.reset();
    showAdminToast('Inventaris direset ke sampel bawaan.');
    loadAdminData();
  }
}

// Init Event Listeners
function initAdminEvents() {
  const searchInput = document.getElementById('adminSearchInput');
  const statusFilter = document.getElementById('adminStatusFilter');
  const catFilter = document.getElementById('adminCatFilter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AdminState.searchQuery = e.target.value;
      renderAdminTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      AdminState.statusFilter = e.target.value;
      renderAdminTable();
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      AdminState.categoryFilter = e.target.value;
      renderAdminTable();
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFormModal();
  });
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
  initAdminEvents();
});
