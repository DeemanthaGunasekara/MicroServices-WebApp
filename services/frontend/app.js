// Fetch and render users from user-service
async function fetchUsers() {
  const loadingEl = document.getElementById('users-loading');
  const listEl = document.getElementById('users-list');

  try {
    const response = await fetch('/api/v1/users');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const users = await response.json();

    loadingEl.style.display = 'none';
    listEl.innerHTML = users.map(user => `
      <div class="card">
        <span class="badge">User #${user.id}</span>
        <h3 style="margin-top: 0.5rem;">${user.name}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">📧 ${user.email}</p>
      </div>
    `).join('');
  } catch (err) {
    loadingEl.innerHTML = `<span style="color: #ef4444;">❌ Failed to load users: ${err.message}</span>`;
  }
}

// Fetch and render products from product-service
async function fetchProducts() {
  const loadingEl = document.getElementById('products-loading');
  const listEl = document.getElementById('products-list');

  try {
    const response = await fetch('/api/v1/products');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const products = await response.json();

    loadingEl.style.display = 'none';
    listEl.innerHTML = products.map(product => `
      <div class="card">
        <span class="badge" style="background: #fef3c7; color: #b45309;">SKU #${product.id}</span>
        <h3 style="margin-top: 0.5rem;">${product.name}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">📦 In Stock: ${product.stock} units</p>
        <div class="price">$${product.price.toFixed(2)}</div>
      </div>
    `).join('');
  } catch (err) {
    loadingEl.innerHTML = `<span style="color: #ef4444;">❌ Failed to load catalog: ${err.message}</span>`;
  }
}

// Initial load: Fetch from both microservices simultaneously!
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();
  fetchProducts();
});