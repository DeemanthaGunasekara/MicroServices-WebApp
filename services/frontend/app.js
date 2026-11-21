/**
 * ShopMate Storefront Application
 * Live Catalog Integration & Real-Time Client Interactivity
 */

// Application State
const state = {
  products: [],
  filteredProducts: [],
  activeCategory: 'all',
  searchQuery: '',
  cartCount: 0
};

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const categoriesBar = document.getElementById('categories-bar');
const productCountLabel = document.getElementById('product-count-label');
const cartCountBadge = document.getElementById('cart-count');

/**
 * Fetch products from the microservice catalog endpoint
 * Gracefully falls back to direct live DummyJSON feed if accessed directly
 */
async function fetchProductCatalog() {
  renderLoadingState();

  try {
    // Try microservice endpoint first, fallback to direct DummyJSON API
    let response;
    try {
      response = await fetch('/api/v1/products');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      response = await fetch('https://dummyjson.com/products?limit=30');
    }

    const data = await response.json();
    state.products = Array.isArray(data) ? data : (data.data || data.products || []);
    state.filteredProducts = [...state.products];

    setupCategoryFilters();
    renderProducts();
  } catch (err) {
    console.error('Failed to load products:', err);
    renderErrorState('Unable to reach the product catalog. Please ensure services are running.');
  }
}

/**
 * Dynamically extract categories from catalog and create filter pills
 */
function setupCategoryFilters() {
  const uniqueCategories = ['all', ...new Set(state.products.map(p => p.category).filter(Boolean))];

  categoriesBar.innerHTML = uniqueCategories.map(cat => {
    const displayName = cat === 'all' 
      ? 'All Products' 
      : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return `
      <button class="cat-pill ${cat === state.activeCategory ? 'active' : ''}" data-category="${cat}">
        ${displayName}
      </button>
    `;
  }).join('');

  // Event delegation for category pill clicks
  categoriesBar.addEventListener('click', (e) => {
    const button = e.target.closest('.cat-pill');
    if (!button) return;

    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    state.activeCategory = button.getAttribute('data-category');
    applyFilters();
  });
}

/**
 * Apply both category filter and search query to current product state
 */
function applyFilters() {
  const query = state.searchQuery.toLowerCase().trim();

  state.filteredProducts = state.products.filter(product => {
    const matchesCategory = state.activeCategory === 'all' || product.category === state.activeCategory;
    const matchesSearch = !query || 
      (product.title && product.title.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

/**
 * Render the filtered products into the responsive grid
 */
function renderProducts() {
  if (state.filteredProducts.length === 0) {
    productCountLabel.textContent = 'Showing 0 items';
    productsGrid.innerHTML = `
      <div class="state-container">
        <div class="state-icon">🔍</div>
        <h3 class="state-title">No products found</h3>
        <p>Try searching for a different keyword or resetting your category filter.</p>
      </div>
    `;
    return;
  }

  productCountLabel.textContent = `Showing ${state.filteredProducts.length} curated ${state.filteredProducts.length === 1 ? 'item' : 'items'}`;

  productsGrid.innerHTML = state.filteredProducts.map(product => {
    const formattedPrice = typeof product.price === 'number' 
      ? `$${product.price.toFixed(2)}` 
      : `$${product.price}`;
    const ratingValue = product.rating || '4.5';
    const categoryName = product.category ? product.category.replace('-', ' ') : 'General';
    const thumbnail = product.thumbnail || product.image || 'https://via.placeholder.com/300x200?text=Product';

    return `
      <article class="product-card">
        <div class="product-image-container">
          <img class="product-image" src="${thumbnail}" alt="${product.title}" loading="lazy" />
          <span class="product-badge">${categoryName}</span>
        </div>
        <div class="product-details">
          <div class="product-rating">
            <span class="star-icon">★</span>
            <span>${ratingValue}</span>
          </div>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description || 'High-quality item designed for durability and performance.'}</p>
          <div class="product-footer">
            <span class="product-price">${formattedPrice}</span>
            <button class="add-btn" onclick="addToCart('${product.id || product.title}')">Add +</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Cart interaction handler
 */
window.addToCart = function(productId) {
  state.cartCount += 1;
  cartCountBadge.textContent = state.cartCount;

  // Subtle button pulse animation
  cartCountBadge.style.transform = 'scale(1.25)';
  setTimeout(() => {
    cartCountBadge.style.transform = 'scale(1)';
  }, 180);
};

/**
 * Loading & Error UI States
 */
function renderLoadingState() {
  productCountLabel.textContent = 'Connecting to catalog...';
  productsGrid.innerHTML = `
    <div class="state-container">
      <div class="state-icon">⏳</div>
      <h3 class="state-title">Loading Catalog</h3>
      <p>Fetching the latest items from our microservices catalog...</p>
    </div>
  `;
}

function renderErrorState(message) {
  productCountLabel.textContent = 'Catalog unavailable';
  productsGrid.innerHTML = `
    <div class="state-container">
      <div class="state-icon">⚠️</div>
      <h3 class="state-title">Service Temporarily Unavailable</h3>
      <p>${message}</p>
    </div>
  `;
}

// Search input listener with real-time filtering
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  applyFilters();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchProductCatalog);