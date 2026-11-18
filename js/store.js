/**
 * Shared Data Store for titipjualsecond
 * Mengelola Produk, Pesanan Pembeli (Orders), dan Autentikasi Admin
 */

const Store = (function() {
  const STORAGE_KEY = 'titipjualsecond_products';
  const ORDERS_KEY = 'titipjualsecond_orders';
  const AUTH_KEY = 'titipjualsecond_admin_token';
  const ADMIN_PIN = 'admin123'; // Default PIN/Password Admin

  // Inisialisasi Produk
  function initProducts() {
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

  function getAll() {
    return initProducts();
  }

  function save(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('titipjualsecond:updated', { detail: products }));
  }

  function getById(id) {
    const products = getAll();
    return products.find(p => p.id === id) || null;
  }

  function add(productData) {
    const products = getAll();
    const newProduct = {
      id: 'tjs-' + Date.now().toString().slice(-6),
      name: productData.name.trim(),
      brand: productData.brand ? productData.brand.trim() : 'Curated',
      category: productData.category || 'clothing',
      gender: productData.gender || 'unisex', // wanita, pria, unisex
      categoryLabel: getCategoryLabel(productData.category),
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 0,
      grade: productData.grade || 'Grade A',
      gradeScore: productData.gradeScore || '95%',
      gradeBadge: getGradeBadge(productData.grade),
      isFeatured: !!productData.isFeatured,
      isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true,
      stock: productData.isAvailable ? 1 : 0,
      size: productData.size ? productData.size.trim() : 'Standar',
      sizeSystem: productData.sizeSystem || 'EU', // EU, UK, US, etc.
      images: Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop'],
      description: productData.description ? productData.description.trim() : 'Barang second terkurasi kualitas prima.',
      conditionDetails: {
        physical: productData.conditionPhysical ? productData.conditionPhysical.trim() : 'Kondisi fisik terawat.',
        function: productData.conditionFunction ? productData.conditionFunction.trim() : '100% Berfungsi normal.',
        completeness: productData.conditionCompleteness ? productData.conditionCompleteness.trim() : 'Unit saja.',
        defect: productData.conditionDefect ? productData.conditionDefect.trim() : 'Minus wajar pemakaian second.',
        origin: productData.conditionOrigin ? productData.conditionOrigin.trim() : 'Titip jual terverifikasi.'
      },
      createdAt: Date.now()
    };

    products.unshift(newProduct);
    save(products);
    return newProduct;
  }

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
      gender: updatedFields.gender || current.gender || 'unisex',
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

  function toggleStatus(id) {
    const products = getAll();
    const item = products.find(p => p.id === id);
    if (!item) return null;

    item.isAvailable = !item.isAvailable;
    item.stock = item.isAvailable ? 1 : 0;
    save(products);
    return item;
  }

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

  function reset() {
    const initial = (typeof DEFAULT_PRODUCTS !== 'undefined') ? DEFAULT_PRODUCTS : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    window.dispatchEvent(new CustomEvent('titipjualsecond:updated', { detail: initial }));
    return initial;
  }

  // ==================== PESANAN PEMBELI (ORDERS) ====================
  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function createOrder(orderData) {
    const orders = getOrders();
    const newOrder = {
      orderId: 'TJS-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: Date.now(),
      customerName: orderData.name,
      customerPhone: orderData.phone,
      customerAddress: orderData.address,
      courier: orderData.courier,
      notes: orderData.notes || '',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'MENUNGGU KONFIRMASI'
    };

    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // Broadcast ke tab admin secara instan
    window.dispatchEvent(new CustomEvent('titipjualsecond:new_order', { detail: newOrder }));
    
    // Juga trigger storage event untuk cross-window sync
    localStorage.setItem('titipjualsecond_latest_order', JSON.stringify({
      orderId: newOrder.orderId,
      time: Date.now()
    }));

    return newOrder;
  }

  function markOrderDone(orderId) {
    const orders = getOrders();
    const o = orders.find(x => x.orderId === orderId);
    if (o) {
      o.status = 'SELESAI / TERKIRIM';
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  }

  // ==================== KEAMANAN ADMIN ====================
  function isAdminLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === 'authenticated_true';
  }

  function loginAdmin(enteredPin) {
    if (enteredPin === ADMIN_PIN) {
      sessionStorage.setItem(AUTH_KEY, 'authenticated_true');
      return true;
    }
    return false;
  }

  function logoutAdmin() {
    sessionStorage.removeItem(AUTH_KEY);
  }

  // Helper
  function getCategoryLabel(cat) {
    const map = {
      'gadgets': 'Kamera & Gadget',
      'clothing': 'Pakaian & Vintage',
      'footwear': 'Sepatu & Sneakers',
      'accessories': 'Jam & Aksesoris',
      'lifestyle': 'Dekor & Hobi'
    };
    return map[cat] || 'Koleksi Second';
  }

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
    getOrders,
    createOrder,
    markOrderDone,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    ADMIN_PIN,
    getCategoryLabel,
    getGradeBadge
  };
})();
