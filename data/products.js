/**
 * Data Default TitipLaku (Titip Jual UMKM & Second-Hand)
 * Menampilkan produk UMKM lokal dan kurasi barang pre-loved pilihan
 */

const DEFAULT_PRODUCTS = [
  {
    id: "tl-001",
    name: "Kripik Singkong Pedas Daun Jeruk (250gr)",
    brand: "Snack Nusantara",
    sellerLocation: "UMKM Bandung",
    category: "kuliner",
    categoryLabel: "Kuliner & Camilan",
    price: 25000,
    originalPrice: 35000,
    grade: "Grade S",
    gradeScore: "100%",
    gradeBadge: "Produksi Baru",
    isFeatured: true,
    isAvailable: true,
    stock: 25,
    size: "Kemasan Pouch 250g",
    rating: 5.0,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Keripik singkong renyah dengan bumbu cabai asli dan aroma daun jeruk segar khas Priangan. Dibuat tanpa bahan pengawet oleh kelompok tani singkong lokal.",
    conditionDetails: {
      physical: "Segel alumunium foil kedap udara rapat.",
      function: "Masa kadaluarsa 6 bulan ke depan.",
      completeness: "Kemasan ziplock higienis.",
      defect: "Tidak ada defect (Fresh batch).",
      origin: "Konsinyasi langsung dari UMKM Bandung Juara."
    },
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: "tl-002",
    name: "Tas Anyaman Bambu Etnik Tradisional",
    brand: "Bambu Kriya",
    sellerLocation: "UMKM Yogyakarta",
    category: "kerajinan",
    categoryLabel: "Kerajinan Tangan",
    price: 85000,
    originalPrice: 125000,
    grade: "Grade S",
    gradeScore: "100%",
    gradeBadge: "Handmade Asli",
    isFeatured: true,
    isAvailable: true,
    stock: 8,
    size: "30 x 20 x 12 cm",
    rating: 4.9,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Tas anyaman tangan dari bambu apus pilihan dengan lapisan vernis alami anti jamur. Tali handle kulit sintetis kokoh dan ramah lingkungan.",
    conditionDetails: {
      physical: "Anyaman rapat dan halus tanpa serat tajam.",
      function: "Kapasitas muat hingga 3 kg aman.",
      completeness: "Unit tas anyaman + dustbag blacu.",
      defect: "Corak serat alami bambu bervariasi unik.",
      origin: "Titip jual pengrajin desa wisata Sleman, Yogyakarta."
    },
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "tl-003",
    name: "Sambal Rumahan Cumi Asin Spesial (200gr)",
    brand: "Dapur Bu Dewi",
    sellerLocation: "UMKM Surabaya",
    category: "kuliner",
    categoryLabel: "Kuliner & Camilan",
    price: 38000,
    originalPrice: 50000,
    grade: "Grade S",
    gradeScore: "100%",
    gradeBadge: "Freshly Made",
    isFeatured: true,
    isAvailable: true,
    stock: 15,
    size: "Toples Kaca 200g",
    rating: 5.0,
    reviewCount: 215,
    images: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Sambal bawang gurih dengan potongan cumi asin empuk melimpah. Dimasak secara tradisional dengan minyak kelapa asli.",
    conditionDetails: {
      physical: "Tutup botol bersegel plastik wrap ganda.",
      function: "Siap santap, tahan 1 bulan suhu ruang atau 3 bulan di kulkas.",
      completeness: "Toples kaca tebal anti bocor.",
      defect: "Tidak ada minus.",
      origin: "Konsinyasi dapur rumahan Surabaya Timur."
    },
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: "tl-004",
    name: "Olympus OM-1 35mm Vintage SLR + 50mm f/1.8",
    brand: "Olympus",
    sellerLocation: "Jakarta Selatan",
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
    rating: 4.9,
    reviewCount: 34,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Kamera analog legendaris mechanical shutter. Suara shutter renyah, lightmeter aktif akurat, view finder bersih bening. Sudah CLA (Clean, Lubricate, Adjust).",
    conditionDetails: {
      physical: "9.5/10 - Bodi sangat mulus, minim tanda penuaan wajar, kulit body rapat sempurna.",
      function: "100% - Mekanikal shutter speed B-1/1000 normal, lightmeter responsif, kokang lancar.",
      completeness: "Unit kamera, Lensa Zuiko 50mm f/1.8, Lens Cap Original, Vintage Leather Strap.",
      defect: "Debu mikro wajar pada lensa (tidak mempengaruhi hasil jepretan).",
      origin: "Titip jual kolektor pribadi Jakarta Selatan."
    },
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: "tl-005",
    name: "Barbour Beaufort Waxed Cotton Jacket Olive",
    brand: "Barbour",
    sellerLocation: "Bandung",
    category: "clothing",
    categoryLabel: "Pakaian & Fashion",
    price: 3100000,
    originalPrice: 6800000,
    grade: "Grade S",
    gradeScore: "98%",
    gradeBadge: "Like New (Mint)",
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    size: "Size 40 / L (P: 82cm, L: 60cm)",
    rating: 5.0,
    reviewCount: 19,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Jaket ikonik outdoor heritage Inggris. Wax coating masih tebal dan beraroma khas. Krah korduroi cokelat pekat tanpa noda, furing tartan klasik utuh tanpa robek.",
    conditionDetails: {
      physical: "9.8/10 - Kain waxed tebal, warna hijau olive merata, kancing kuningan utuh berkilau.",
      function: "100% - Ritsleting YKK kuningan ganda lancar, kantong cartridge utuh.",
      completeness: "Jaket unit, pin lencana Barbour enamel, hanger resmi Barbour.",
      defect: "Tidak ada defect berarti. Pemakaian hanya 2 kali indoor.",
      origin: "Titip jual koleksi pribadi, beli di store resmi Tokyo."
    },
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: "tl-006",
    name: "Red Wing Iron Ranger 8111 Amber Harness Boots",
    brand: "Red Wing",
    sellerLocation: "Semarang",
    category: "footwear",
    categoryLabel: "Sepatu & Sneakers",
    price: 3650000,
    originalPrice: 6200000,
    grade: "Grade B",
    gradeScore: "88%",
    gradeBadge: "Authentic Vintage",
    isFeatured: false,
    isAvailable: true,
    stock: 1,
    size: "US 8.5 D / 41.5 - 42 EU",
    rating: 4.8,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Sepatu boots kulit tangguh legendaris buatan USA. Patina kulit Amber Harness matang natural dan sangat berkarakter. Sol Vibram 430 masih tebal 85%.",
    conditionDetails: {
      physical: "8.8/10 - Karakter patina vintage mewah, kulit rutin di-treatment dengan boot oil.",
      function: "100% - Konstruksi Goodyear Welt kokoh, eyelet baja utuh, sol tidak getas.",
      completeness: "Sepatu + tali boots bawaan taslan + tali cadangan kulit + box pengganti.",
      defect: "Creasing alami pada toe box dan scuff vintage di samping luar.",
      origin: "Titip jual hobi outdoor."
    },
    createdAt: Date.now() - 86400000 * 6
  }
];
