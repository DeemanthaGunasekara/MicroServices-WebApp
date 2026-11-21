/**
 * ShopMate Storefront Application
 * Live Catalog Integration & PostgreSQL User Authentication
 */

// Application State
const state = {
  products: [],
  filteredProducts: [],
  activeCategory: 'all',
  searchQuery: '',
  cartCount: 0,
  currentUser: null
};

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const categoriesBar = document.getElementById('categories-bar');
const productCountLabel = document.getElementById('product-count-label');
const cartCountBadge = document.getElementById('cart-count');

// Auth Modal Elements
const authModal = document.getElementById('auth-modal');
const openAuthBtn = document.getElementById('open-auth-btn');
const closeAuthBtn = document.getElementById('close-auth-btn');
const signupForm = document.getElementById('signup-form');
const authFeedback = document.getElementById('auth-feedback');
const signupSubmitBtn = document.getElementById('signup-submit-btn');

// DB View Modal Elements
const dbModal = document.getElementById('db-modal');
const openDbBtn = document.getElementById('open-db-btn');
const closeDbBtn = document.getElementById('close-db-btn');
const dbUsersBody = document.getElementById('db-users-body');

/**
 * Fetch products from the microservice catalog endpoint
 * Gracefully falls back to direct live DummyJSON feed if accessed directly
 */
async function fetchProductCatalog() {
  renderLoadingState();

  try {
    let response;
    try {
      response = await fetch('/api/v1/products');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      response = await fetch('https://dummyjson.com/products?limit=100');
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

  productCountLabel.textContent = `Showing ${state.filteredProducts.length} curated marketplace items`;

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
      <p>Fetching 100+ marketplace items from live microservices feed...</p>
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

/**
 * DB Table Modal Handlers
 */
if (openDbBtn) {
  openDbBtn.addEventListener('click', async () => {
    dbModal.style.display = 'flex';
    dbUsersBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">Connecting to PostgreSQL...</td></tr>';
    try {
      const res = await fetch('/api/v1/users');
      const data = await res.json();
      const users = data.data || [];
      if (users.length === 0) {
        dbUsersBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">No registered users found in PostgreSQL.</td></tr>';
        return;
      }
      dbUsersBody.innerHTML = users.map(u => `
        <tr>
          <td><strong>#${u.id}</strong></td>
          <td>${u.name}</td>
          <td><code>${u.email}</code></td>
          <td><span class="product-badge" style="position:static;">${u.role || 'Customer'}</span></td>
          <td>${new Date(u.created_at).toLocaleString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      dbUsersBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#c00;">Error fetching from PostgreSQL: ${err.message}</td></tr>`;
    }
  });
}

if (closeDbBtn) {
  closeDbBtn.addEventListener('click', () => {
    dbModal.style.display = 'none';
  });
}

if (dbModal) {
  dbModal.addEventListener('click', (e) => {
    if (e.target === dbModal) {
      dbModal.style.display = 'none';
    }
  });
}

/**
 * Modal Event Handlers
 */
if (openAuthBtn) {
  openAuthBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
    authFeedback.style.display = 'none';
  });
}

if (closeAuthBtn) {
  closeAuthBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
  });
}

if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
  });
}

/**
 * User Registration Form Submission (Connected to PostgreSQL)
 */
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;

    signupSubmitBtn.disabled = true;
    signupSubmitBtn.textContent = 'Registering in PostgreSQL...';
    authFeedback.style.display = 'none';

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'Customer' })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Success feedback
      authFeedback.className = 'auth-feedback success';
      authFeedback.innerHTML = `🎉 <strong>Success!</strong> Welcome, <strong>${name}</strong>! Your account is securely stored in PostgreSQL.`;
      authFeedback.style.display = 'block';

      // Update button in navbar to show user profile
      const firstName = name.split(' ')[0];
      openAuthBtn.innerHTML = `👤 ${firstName} ✓`;
      openAuthBtn.style.backgroundColor = '#ecfdf5';
      openAuthBtn.style.color = '#065f46';
      openAuthBtn.style.borderColor = '#a7f3d0';

      signupForm.reset();

      // Automatically close modal after 1.8 seconds
      setTimeout(() => {
        authModal.style.display = 'none';
      }, 1800);
    } catch (err) {
      authFeedback.className = 'auth-feedback error';
      authFeedback.textContent = `⚠️ ${err.message}`;
      authFeedback.style.display = 'block';
    } finally {
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.textContent = 'Create Account';
    }
  });
}

// Search input listener with real-time filtering
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  applyFilters();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchProductCatalog);