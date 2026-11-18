/**
 * Shared Data Store for titipjualsecond
 * Menghubungkan Toko Publik (index.html) dan CMS Admin (admin.html)
 */

const Store = (function() {
  const STORAGE_KEY = 'titipjualsecond_products';

  // Inisialisasi data produk dari localStorage atau default
  function init() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const initialData = (typeof DEFAULT_PRODUCTS !== 'undefined') ? DEFAULT_PRODUCTS : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.error('Error parsing stored products:', e);
      return [];
    }
  }

  // Dapatkan seluruh daftar produk
  function getAll() {
    return init();
  }

  // Simpan array produk ke localStorage
  function save(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('titipjualsecond:updated', { detail: products }));
  }

  // Dapatkan produk berdasarkan ID
  function getById(id) {
    const products = getAll();
    return products.find(p => p.id === id) || null;
  }

  // Tambah produk baru dari CMS Admin
  function add(productData) {
    const products = getAll();
    const newProduct = {
      id: 'tjs-' + Date.now().toString().slice(-6),
      name: productData.name.trim(),
      brand: productData.brand ? productData.brand.trim() : 'Vintage / Curated',
      category: productData.category || 'clothing',
      categoryLabel: getCategoryLabel(productData.category),
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 0,
      grade: productData.grade || 'Grade A',
      gradeScore: productData.gradeScore || '95%',
      gradeBadge: getGradeBadge(productData.grade),
      isFeatured: !!productData.isFeatured,
      isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true,
      stock: productData.isAvailable ? 1 : 0,
      size: productData.size ? productData.size.trim() : 'All Size / Standar',
      images: Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop'],
      description: productData.description ? productData.description.trim() : 'Barang second terkurasi.',
      conditionDetails: {
        physical: productData.conditionPhysical ? productData.conditionPhysical.trim() : 'Kondisi fisik terawat.',
        function: productData.conditionFunction ? productData.conditionFunction.trim() : '100% Berfungsi normal.',
        completeness: productData.conditionCompleteness ? productData.conditionCompleteness.trim() : 'Unit saja.',
        defect: productData.conditionDefect ? productData.conditionDefect.trim() : 'Minus wajar pemakaian.',
        origin: productData.conditionOrigin ? productData.conditionOrigin.trim() : 'Titip jual terverifikasi.'
      },
      createdAt: Date.now()
    };

    products.unshift(newProduct);
    save(products);
    return newProduct;
  }

  // Update produk yang sudah ada
  function update(id, updatedFields) {
    const products = getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = products[index];
    const category = updatedFields.category || current.category;
    const grade = updatedFields.grade || current.grade;

    products[index] = {
      ...current,
      name: updatedFields.name !== undefined ? updatedFields.name.trim() : current.name,
      brand: updatedFields.brand !== undefined ? updatedFields.brand.trim() : current.brand,
      category: category,
      categoryLabel: getCategoryLabel(category),
      price: updatedFields.price !== undefined ? Number(updatedFields.price) : current.price,
      originalPrice: updatedFields.originalPrice !== undefined ? Number(updatedFields.originalPrice) : current.originalPrice,
      grade: grade,
      gradeScore: updatedFields.gradeScore !== undefined ? updatedFields.gradeScore : current.gradeScore,
      gradeBadge: getGradeBadge(grade),
      isFeatured: updatedFields.isFeatured !== undefined ? !!updatedFields.isFeatured : current.isFeatured,
      isAvailable: updatedFields.isAvailable !== undefined ? !!updatedFields.isAvailable : current.isAvailable,
      stock: (updatedFields.isAvailable !== undefined ? updatedFields.isAvailable : current.isAvailable) ? 1 : 0,
      size: updatedFields.size !== undefined ? updatedFields.size.trim() : current.size,
      images: updatedFields.images && updatedFields.images.length > 0 ? updatedFields.images : current.images,
      description: updatedFields.description !== undefined ? updatedFields.description.trim() : current.description,
      conditionDetails: {
        physical: updatedFields.conditionPhysical !== undefined ? updatedFields.conditionPhysical.trim() : current.conditionDetails.physical,
        function: updatedFields.conditionFunction !== undefined ? updatedFields.conditionFunction.trim() : current.conditionDetails.function,
        completeness: updatedFields.conditionCompleteness !== undefined ? updatedFields.conditionCompleteness.trim() : current.conditionDetails.completeness,
        defect: updatedFields.conditionDefect !== undefined ? updatedFields.conditionDefect.trim() : current.conditionDetails.defect,
        origin: updatedFields.conditionOrigin !== undefined ? updatedFields.conditionOrigin.trim() : current.conditionDetails.origin
      },
      updatedAt: Date.now()
    };

    save(products);
    return products[index];
  }

  // Toggle status barang (Tersedia / Terjual)
  function toggleStatus(id) {
    const products = getAll();
    const item = products.find(p => p.id === id);
    if (!item) return null;

    item.isAvailable = !item.isAvailable;
    item.stock = item.isAvailable ? 1 : 0;
    save(products);
    return item;
  }

  // Hapus produk
  function remove(id) {
    let products = getAll();
    const initialLen = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length !== initialLen) {
      save(products);
      return true;
    }
    return false;
  }

  // Reset ke data awal bawaan
  function reset() {
    const initial = (typeof DEFAULT_PRODUCTS !== 'undefined') ? DEFAULT_PRODUCTS : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    window.dispatchEvent(new CustomEvent('titipjualsecond:updated', { detail: initial }));
    return initial;
  }

  // Helper label kategori
  function getCategoryLabel(cat) {
    const map = {
      'gadgets': 'Kamera & Gadget',
      'clothing': 'Pakaian & Vintage',
      'footwear': 'Sepatu & Tas',
      'accessories': 'Jam & Aksesoris',
      'lifestyle': 'Dekor & Hobi'
    };
    return map[cat] || 'Koleksi Second';
  }

  // Helper badge grade
  function getGradeBadge(grade) {
    if (grade === 'Grade S') return 'Like New (Mint)';
    if (grade === 'Grade A') return 'Sangat Mulus';
    if (grade === 'Grade B') return 'Authentic Vintage';
    return 'Kondisi Baik';
  }

  return {
    getAll,
    getById,
    add,
    update,
    remove,
    toggleStatus,
    reset,
    getCategoryLabel,
    getGradeBadge
  };
})();
