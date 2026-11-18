/**
 * Data Default Titip Jual Second
 * Koleksi awal jika local database belum terisi
 */

const DEFAULT_PRODUCTS = [
  {
    id: "tjs-001",
    name: "Olympus OM-1 35mm SLR Film Camera + 50mm f/1.8",
    brand: "Olympus",
    category: "gadgets",
    categoryLabel: "Kamera & Gadget",
    price: 2450000,
    originalPrice: 4200000,
    grade: "Grade A",
    gradeScore: "95%",
    gradeBadge: "Sangat Mulus",
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    size: "Body + Lensa 50mm",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Kamera analog legendaris mechanical shutter. Suara shutter renyah, lightmeter aktif akurat, view finder bersih bening. Sudah CLA (Clean, Lubricate, Adjust).",
    conditionDetails: {
      physical: "9.5/10 - Bodi sangat mulus, minim tanda penuaan wajar, kulit body rapat sempurna.",
      function: "100% - Mekanikal shutter speed B-1/1000 normal, lightmeter responsif, kokang lancar.",
      completeness: "Unit kamera, Lensa Zuiko 50mm f/1.8, Lens Cap Original, Vintage Leather Strap.",
      defect: "Debu mikro wajar pada lensa (tidak mempengaruhi hasil jepretan sama sekali).",
      origin: "Titip jual kolektor pribadi Jakarta Selatan."
    },
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: "tjs-002",
    name: "Barbour Beaufort Waxed Cotton Jacket Olive",
    brand: "Barbour",
    category: "clothing",
    categoryLabel: "Pakaian & Vintage",
    price: 3100000,
    originalPrice: 6800000,
    grade: "Grade S",
    gradeScore: "98%",
    gradeBadge: "Like New (Mint)",
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    size: "Size 40 / L (P: 82cm, L: 60cm)",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Jaket ikonik outdoor heritage Inggris. Wax coating masih tebal dan beraroma khas. Krah korduroi cokelat pekat tanpa noda, furing tartan klasik utuh tanpa robek.",
    conditionDetails: {
      physical: "9.8/10 - Kain waxed tebal, warna hijau olive merata, kancing kuningan utuh berkilau.",
      function: "100% - Ritsleting YKK kuningan ganda lancar, kantong cartridge utuh.",
      completeness: "Jaket unit, pin lencana Barbour enamel, hanger resmi Barbour.",
      defect: "Tidak ada defect berarti. Pemakaian hanya 2 kali indoor.",
      origin: "Titip jual koleksi pribadi, beli di store resmi Tokyo."
    },
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "tjs-003",
    name: "Sony WH-1000XM4 Noise Cancelling Silver",
    brand: "Sony",
    category: "gadgets",
    categoryLabel: "Kamera & Gadget",
    price: 2150000,
    originalPrice: 3999000,
    grade: "Grade A",
    gradeScore: "93%",
    gradeBadge: "Sangat Mulus",
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    size: "Over-Ear Wireless",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Headphone wireless noise cancelling terbaik di kelasnya. Baterai tahan lebih dari 28 jam dengan ANC aktif. Earpads sudah dibersihkan steril.",
    conditionDetails: {
      physical: "9.3/10 - Earpad kulit empuk utuh tanpa pecah, bodi headband mulus terawat.",
      function: "100% - ANC aktif maksimal, touch sensor reponsif, mikrofon jernih.",
      completeness: "Fullset: Hardcase original, kabel jack 3.5mm, adapter pesawat, kabel charger Type-C, Box.",
      defect: "Baret rambut tipis sekali di area cup kanan dekat logo Sony.",
      origin: "Garansi resmi Sony Indonesia sudah habis (pemakaian 1 tahun)."
    },
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: "tjs-004",
    name: "Red Wing Iron Ranger 8111 Amber Harness Boots",
    brand: "Red Wing",
    category: "footwear",
    categoryLabel: "Sepatu & Tas",
    price: 3650000,
    originalPrice: 6200000,
    grade: "Grade B",
    gradeScore: "88%",
    gradeBadge: "Authentic Vintage",
    isFeatured: false,
    isAvailable: true,
    stock: 1,
    size: "US 8.5 D / 41.5 - 42 EU",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Sepatu boots kulit tangguh legendaris buatan USA. Patina kulit Amber Harness matang natural dan sangat berkarakter. Sol Vibram 430 masih tebal 85%.",
    conditionDetails: {
      physical: "8.8/10 - Karakter patina vintage mewah, kulit rutin di-treatment dengan boot oil.",
      function: "100% - Konstruksi Goodyear Welt kokoh, eyelet baja utuh, sol tidak getas.",
      completeness: "Sepatu + tali boots bawaan taslan + tali cadangan kulit + box pengganti.",
      defect: "Creasing alami pada toe box dan scuff vintage di samping luar.",
      origin: "Titip jual hobi outdoor."
    },
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: "tjs-005",
    name: "Seiko 5 Vintage Automatic Diver SKX007K",
    brand: "Seiko",
    category: "accessories",
    categoryLabel: "Jam & Aksesoris",
    price: 2850000,
    originalPrice: 4750000,
    grade: "Grade A",
    gradeScore: "94%",
    gradeBadge: "Sangat Mulus",
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    size: "Diameter 42mm",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Diver watch legendaris bersertifikat ISO 6425 (discontinue). Mesin otomatis 7S26 bandel, akurasi stabil +5 detik/hari.",
    conditionDetails: {
      physical: "9.4/10 - Kaca Hardlex bening jernih tanpa goresan, bezel klik 120 tegas berputar.",
      function: "100% - Power reserve 40 jam normal, tanggal & hari berganti mulus tengah malam.",
      completeness: "Jam tangan, rantai Jubilee original + bonus tali NATO strap warna khaki & box jam.",
      defect: "Micro swirl pada clasp rantai stainless wajar pemakaian kantor.",
      origin: "Koleksi pribadi horology enthusiast."
    },
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: "tjs-006",
    name: "Marshall Acton II Bluetooth Speaker Black",
    brand: "Marshall",
    category: "lifestyle",
    categoryLabel: "Dekor & Hobi",
    price: 1890000,
    originalPrice: 3290000,
    grade: "Grade S",
    gradeScore: "99%",
    gradeBadge: "Like New (Mint)",
    isFeatured: true,
    isAvailable: false, // Contoh barang yang sudah TERJUAL
    stock: 0,
    size: "260 x 160 x 150 mm",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop"
    ],
    description: "Home speaker dengan sentuhan retro rock n roll. Suara bass bertenaga dan treble jernih. Dilengkapi kenop analog kuningan.",
    conditionDetails: {
      physical: "9.9/10 - Lapisan vinyl tekstur mulus 100%, grill kain depan bersih tanpa noda.",
      function: "100% - Koneksi Bluetooth 5.0 stabil, port AUX normal, kenop analog lancar.",
      completeness: "Lengkap Fullset: Unit speaker, kabel power original, buku panduan, Box asli.",
      defect: "Box kemasan luar ada sedikit bekas sobek solasi pengiriman.",
      origin: "Ex display kamar tidur pribadi, jarang dinyalakan."
    },
    createdAt: Date.now() - 86400000 * 6
  }
];
