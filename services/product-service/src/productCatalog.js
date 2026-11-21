// High-quality fallback items with real images for offline dev and CI runners
const fallbackCatalog = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max',
    description: 'Titanium design with A17 Pro chip, 48MP camera, and 5x Telephoto lens.',
    price: 1199,
    category: 'smartphones',
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    stock: 25
  },
  {
    id: 2,
    title: 'MacBook Pro 16" M3 Max',
    description: 'Liquid Retina XDR display, 36GB unified memory, and 22-hour battery life.',
    price: 3499,
    category: 'laptops',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
    rating: 4.9,
    stock: 12
  },
  {
    id: 3,
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation, dual processors, and 30-hour battery.',
    price: 399,
    category: 'audio',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    rating: 4.7,
    stock: 40
  },
  {
    id: 4,
    title: 'Apple Watch Ultra 2',
    description: 'Rugged titanium case, precision dual-frequency GPS, and up to 36 hours of battery.',
    price: 799,
    category: 'wearables',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    rating: 4.6,
    stock: 18
  },
  {
    id: 5,
    title: 'Sony Alpha 7 IV Full-Frame Camera',
    description: '33MP Exmor R CMOS sensor, 4K 60p recording, and real-time Eye AF.',
    price: 2499,
    category: 'cameras',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
    rating: 4.9,
    stock: 8
  },
  {
    id: 6,
    title: 'Logitech MX Master 3S',
    description: 'Quiet click performance mouse with 8K DPI sensor and MagSpeed scrolling.',
    price: 99,
    category: 'accessories',
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60',
    rating: 4.8,
    stock: 50
  }
];

let cachedProducts = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches products from external e-commerce API with in-memory caching and fallback
 */
async function fetchECommerceProducts() {
  const now = Date.now();
  if (cachedProducts && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedProducts;
  }

    try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://dummyjson.com/products?limit=100', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      cachedProducts = data.products.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        thumbnail: p.thumbnail,
        rating: p.rating,
        stock: p.stock
      }));
      lastFetchTime = now;
      console.log(`[Product Service] Successfully fetched and cached ${cachedProducts.length} live products from external API.`);
      return cachedProducts;
    }
  } catch (err) {
    console.warn(`[Product Service] External product API unreachable (${err.message}). Using resilient backup catalog.`);
  }

  return fallbackCatalog;
}

/**
 * Retrieves products with optional filtering by category or search query
 */
async function getProducts({ category, search } = {}) {
  let products = await fetchECommerceProducts();

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const query = search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }

  return products;
}

/**
 * Returns list of unique categories
 */
async function getCategories() {
  const products = await fetchECommerceProducts();
  const categories = Array.from(new Set(products.map(p => p.category)));
  return ['all', ...categories];
}

module.exports = {
  getProducts,
  getCategories,
  fallbackCatalog
};