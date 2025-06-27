// Shop Page JavaScript

// DOM Elements
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const priceMinSlider = document.getElementById('price-min');
const priceMaxSlider = document.getElementById('price-max');
const priceMinLabel = document.getElementById('price-min-label');
const priceMaxLabel = document.getElementById('price-max-label');
const productsGrid = document.getElementById('products-grid');
const noResults = document.getElementById('no-results');
const viewBtns = document.querySelectorAll('.view-btn');
const tryVirtualBtns = document.querySelectorAll('.try-virtual-btn');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
const quickViewBtns = document.querySelectorAll('.quick-view-btn');

// State
let currentFilters = {
    category: 'all',
    type: 'all',
    priceMin: 0,
    priceMax: 200,
    search: '',
    sort: 'name'
};

let currentView = 'grid';
let allProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
    setupEventListeners();
    loadProducts();
    applyFilters();
});

// Initialize Shop
function initializeShop() {
    // Update price labels
    updatePriceLabels();
    
    // Check URL parameters for initial filters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('category')) {
        currentFilters.category = urlParams.get('category');
        updateActiveFilter('category', currentFilters.category);
    }
    
    // Load cart from localStorage
    loadCart();
    
    console.log('Shop initialized successfully');
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Price range sliders
    if (priceMinSlider && priceMaxSlider) {
        priceMinSlider.addEventListener('input', handlePriceChange);
        priceMaxSlider.addEventListener('input', handlePriceChange);
    }
    
    // View toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // Product actions
    setupProductActions();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Load Products Data
function loadProducts() {
    const productCards = document.querySelectorAll('.product-card');
    allProducts = Array.from(productCards).map(card => {
        return {
            element: card,
            name: card.dataset.name || card.querySelector('h3').textContent,
            category: card.dataset.category,
            type: card.dataset.type,
            price: parseFloat(card.dataset.price),
            rating: extractRating(card),
            reviews: extractReviews(card)
        };
    });
    
    console.log(`Loaded ${allProducts.length} products`);
}

// Extract rating from product card
function extractRating(card) {
    const stars = card.querySelectorAll('.product-rating .fas.fa-star');
    return stars.length;
}

// Extract review count from product card
function extractReviews(card) {
    const reviewText = card.querySelector('.product-rating span');
    if (reviewText) {
        const match = reviewText.textContent.match(/\((\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
    return 0;
}

// Handle Search
function handleSearch() {
    currentFilters.search = searchInput.value.toLowerCase().trim();
    applyFilters();
    trackEvent('search', { query: currentFilters.search });
}

// Handle Filter Click
function handleFilterClick(e) {
    const btn = e.currentTarget;
    const filterType = btn.dataset.category ? 'category' : 'type';
    const filterValue = btn.dataset.category || btn.dataset.type;
    
    // Update active state
    updateActiveFilter(filterType, filterValue);
    
    // Update current filters
    currentFilters[filterType] = filterValue;
    
    // Apply filters
    applyFilters();
    
    trackEvent('filter', { type: filterType, value: filterValue });
}

// Update Active Filter
function updateActiveFilter(type, value) {
    const selector = type === 'category' ? '[data-category]' : '[data-type]';
    const buttons = document.querySelectorAll(`.filter-btn${selector}`);
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const btnValue = btn.dataset.category || btn.dataset.type;
        if (btnValue === value) {
            btn.classList.add('active');
        }
    });
}

// Handle Sort Change
function handleSortChange() {
    currentFilters.sort = sortSelect.value;
    applyFilters();
    trackEvent('sort', { method: currentFilters.sort });
}

// Handle Price Change
function handlePriceChange() {
    const minVal = parseInt(priceMinSlider.value);
    const maxVal = parseInt(priceMaxSlider.value);
    
    // Ensure min is not greater than max
    if (minVal >= maxVal) {
        if (priceMinSlider === document.activeElement) {
            priceMaxSlider.value = minVal + 1;
        } else {
            priceMinSlider.value = maxVal - 1;
        }
    }
    
    currentFilters.priceMin = parseInt(priceMinSlider.value);
    currentFilters.priceMax = parseInt(priceMaxSlider.value);
    
    updatePriceLabels();
    debounce(applyFilters, 300)();
}

// Update Price Labels
function updatePriceLabels() {
    if (priceMinLabel && priceMaxLabel) {
        priceMinLabel.textContent = `$${priceMinSlider.value}`;
        priceMaxLabel.textContent = `$${priceMaxSlider.value}`;
    }
}

// Handle View Change
function handleViewChange(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;
    
    // Update active state
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update view
    currentView = view;
    productsGrid.className = view === 'list' ? 'products-grid list-view' : 'products-grid';
    
    trackEvent('view_change', { view: view });
}

// Apply Filters
function applyFilters() {
    let filteredProducts = [...allProducts];
    
    // Apply category filter
    if (currentFilters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentFilters.category
        );
    }
    
    // Apply type filter
    if (currentFilters.type !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.type === currentFilters.type
        );
    }
    
    // Apply price filter
    filteredProducts = filteredProducts.filter(product => 
        product.price >= currentFilters.priceMin && product.price <= currentFilters.priceMax
    );
    
    // Apply search filter
    if (currentFilters.search) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(currentFilters.search) ||
            product.category.toLowerCase().includes(currentFilters.search) ||
            product.type.toLowerCase().includes(currentFilters.search)
        );
    }
    
    // Apply sorting
    filteredProducts = sortProducts(filteredProducts);
    
    // Update display
    updateProductsDisplay(filteredProducts);
    
    console.log(`Filtered to ${filteredProducts.length} products`);
}

// Sort Products
function sortProducts(products) {
    switch (currentFilters.sort) {
        case 'name':
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case 'price-low':
            return products.sort((a, b) => a.price - b.price);
        case 'price-high':
            return products.sort((a, b) => b.price - a.price);
        case 'newest':
            return products.reverse(); // Assume last added is newest
        case 'popular':
            return products.sort((a, b) => b.reviews - a.reviews);
        default:
            return products;
    }
}

// Update Products Display
function updateProductsDisplay(filteredProducts) {
    // Hide all products
    allProducts.forEach(product => {
        product.element.style.display = 'none';
    });
    
    // Show filtered products
    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => {
            product.element.style.display = 'block';
        });
        noResults.style.display = 'none';
    } else {
        noResults.style.display = 'block';
    }
    
    // Re-setup product actions for visible products
    setupProductActions();
}

// Setup Product Actions
function setupProductActions() {
    // Try Virtual buttons
    document.querySelectorAll('.try-virtual-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // Remove old listeners
    });
    
    document.querySelectorAll('.try-virtual-btn').forEach(btn => {
        btn.addEventListener('click', handleTryVirtual);
    });
    
    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // Remove old listeners
    });
    
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
    
    // Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // Remove old listeners
    });
    
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickView);
    });
}

// Handle Try Virtual
function handleTryVirtual(e) {
    const btn = e.currentTarget;
    const itemId = btn.dataset.item;
    
    // Add loading state
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    // Simulate loading and redirect
    setTimeout(() => {
        window.location.href = `virtual-tryon.html?item=${itemId}`;
    }, 1000);
    
    trackEvent('try_virtual', { item: itemId });
}

// Handle Add to Cart
function handleAddToCart(e) {
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const productCard = btn.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    
    // Add to cart
    addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: 'placeholder' // In real app, would get actual image
    });
    
    // Visual feedback
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.style.background = '#28a745';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
    }, 2000);
    
    trackEvent('add_to_cart', { product: productId });
}

// Handle Quick View
function handleQuickView(e) {
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const productCard = btn.closest('.product-card');
    
    // Create modal (simplified version)
    showQuickViewModal(productCard);
    
    trackEvent('quick_view', { product: productId });
}

// Show Quick View Modal
function showQuickViewModal(productCard) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${productCard.querySelector('h3').textContent}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    ${productCard.querySelector('.product-image').innerHTML}
                </div>
                <div class="modal-info">
                    <p class="modal-category">${productCard.querySelector('.product-category').textContent}</p>
                    <p class="modal-price">${productCard.querySelector('.product-price').textContent}</p>
                    <div class="modal-rating">
                        ${productCard.querySelector('.product-rating').innerHTML}
                    </div>
                    <p class="modal-description">High-quality clothing item perfect for any occasion. Made with premium materials and designed for comfort and style.</p>
                    <div class="modal-actions">
                        ${productCard.querySelector('.product-actions').innerHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .quick-view-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 800px;
                width: 90%;
                max-height: 90%;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .modal-body {
                display: flex;
                padding: 20px;
                gap: 30px;
            }
            .modal-image {
                flex: 1;
                min-height: 300px;
            }
            .modal-info {
                flex: 1;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @media (max-width: 768px) {
                .modal-body {
                    flex-direction: column;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);
    
    // Setup modal events
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Re-setup product actions in modal
    setupProductActions();
}

// Cart Management
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('virtualfit_cart') || '[]');
    
    // Check if product already exists
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('virtualfit_cart', JSON.stringify(cart));
    updateCartCount();
}

function loadCart() {
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('virtualfit_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update cart count in navigation if element exists
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Keyboard Navigation
function handleKeyboardNavigation(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modal = document.querySelector('.quick-view-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
    
    // Enter key on focused filter buttons
    if (e.key === 'Enter' && e.target.classList.contains('filter-btn')) {
        e.target.click();
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function trackEvent(eventName, properties = {}) {
    // Analytics tracking (placeholder)
    console.log(`Event: ${eventName}`, properties);
    
    // In a real application, you would send this to your analytics service
    // Example: analytics.track(eventName, properties);
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Shop page error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Performance Monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Shop page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

console.log('Shop JavaScript loaded successfully');