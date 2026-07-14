// ====================================
// Product Database
// ====================================
const products = [
    {
        id: 1,
        name: "Scarab Amulet",
        category: "egyptian",
        price: 2850,
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop",
        description: "Sacred beetle amulet in lapis lazuli, symbolizing rebirth and transformation.",
        origin: "New Kingdom, 1550-1077 BCE"
    },
    {
        id: 2,
        name: "Roman Coin Collection",
        category: "roman",
        price: 3200,
        image: "https://images.unsplash.com/photo-1621348881364-c7d6d5e8b127?w=800&h=600&fit=crop",
        description: "Five authentic denarii featuring emperors Augustus through Nero.",
        origin: "Imperial Rome, 27 BCE-68 CE"
    },
    {
        id: 3,
        name: "Greek Amphora",
        category: "greek",
        price: 12500,
        image: "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&h=600&fit=crop",
        description: "Black-figure pottery depicting mythological scenes of Hercules.",
        origin: "Archaic Period, 600-480 BCE"
    },
    {
        id: 4,
        name: "Cuneiform Tablet",
        category: "mesopotamian",
        price: 8750,
        image: "https://images.unsplash.com/photo-1509715513011-e394f0cb20c4?w=800&h=600&fit=crop",
        description: "Clay tablet with administrative records in ancient Sumerian script.",
        origin: "Ur III Dynasty, 2100-2000 BCE"
    },
    {
        id: 5,
        name: "Egyptian Ushabti",
        category: "egyptian",
        price: 4200,
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
        description: "Servant figurine in glazed faience, inscribed with protective spells.",
        origin: "Late Period, 664-332 BCE"
    },
    {
        id: 6,
        name: "Roman Glass Vessel",
        category: "roman",
        price: 5600,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=600&fit=crop",
        description: "Iridescent glass perfume bottle with distinctive patina.",
        origin: "Roman Empire, 1st-2nd Century CE"
    },
    {
        id: 7,
        name: "Bronze Statue Fragment",
        category: "greek",
        price: 15800,
        image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop",
        description: "Classical bronze arm from a larger deity statue, museum quality.",
        origin: "Classical Period, 480-323 BCE"
    },
    {
        id: 8,
        name: "Terracotta Warrior",
        category: "asian",
        price: 28000,
        image: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop",
        description: "Miniature warrior figure from the Qin Dynasty funerary tradition.",
        origin: "Qin Dynasty, 221-206 BCE"
    },
    {
        id: 9,
        name: "Babylonian Seal",
        category: "mesopotamian",
        price: 6400,
        image: "https://images.unsplash.com/photo-1518281361980-b26bfd556770?w=800&h=600&fit=crop",
        description: "Cylinder seal depicting divine figures and cuneiform inscription.",
        origin: "Old Babylonian, 1900-1600 BCE"
    },
    {
        id: 10,
        name: "Ming Dynasty Vase",
        category: "asian",
        price: 19500,
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop",
        description: "Blue and white porcelain with dragon motif, imperial quality.",
        origin: "Ming Dynasty, 1368-1644 CE"
    },
    {
        id: 11,
        name: "Egyptian Cartouche",
        category: "egyptian",
        price: 7800,
        image: "https://images.unsplash.com/photo-1615492126985-7ae8f4d8ad64?w=800&h=600&fit=crop",
        description: "Gold-plated hieroglyphic name plate of a royal scribe.",
        origin: "Middle Kingdom, 2040-1782 BCE"
    },
    {
        id: 12,
        name: "Greek Theatrical Mask",
        category: "greek",
        price: 9200,
        image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop",
        description: "Terracotta comedy mask from ancient theatrical performances.",
        origin: "Hellenistic Period, 323-31 BCE"
    },
    {
        id: 13,
        name: "Phoenician Glass Bead",
        category: "mesopotamian",
        price: 3400,
        image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800&h=600&fit=crop",
        description: "Cobalt blue eye bead, believed to ward off evil spirits.",
        origin: "Phoenician Empire, 1200-800 BCE"
    },
    {
        id: 14,
        name: "Jade Dragon Pendant",
        category: "asian",
        price: 16200,
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&h=600&fit=crop",
        description: "Exquisitely carved nephrite jade depicting a celestial dragon.",
        origin: "Han Dynasty, 206 BCE-220 CE"
    },
    {
        id: 15,
        name: "Etruscan Mirror",
        category: "roman",
        price: 11400,
        image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=600&fit=crop",
        description: "Bronze hand mirror with engraved mythological scene.",
        origin: "Etruscan Civilization, 400-300 BCE"
    }
];

// ====================================
// Shopping Cart State
// ====================================
let cart = [];

// ====================================
// Initialize Application
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    setupFilterButtons();
    setupCartToggle();
    setupScrollAnimations();
    setupThemeToggle();
    loadCartFromStorage();
    loadThemeFromStorage();
});

// ====================================
// Product Display Functions
// ====================================
function displayProducts(filter = 'all') {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);
    
    filteredProducts.forEach((product, index) => {
        const card = createProductCard(product, index);
        container.appendChild(card);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-overlay"></div>
            <div class="product-category-badge">${product.category}</div>
        </div>
        <div class="product-body">
            <div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
            </div>
            <div class="product-footer">
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-plus"></i>
                    <span>Add</span>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ====================================
// Filter Functionality
// ====================================
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter products
            const filter = button.getAttribute('data-filter');
            displayProducts(filter);
        });
    });
}

// ====================================
// Shopping Cart Functions
// ====================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    saveCartToStorage();
    showAddToCartAnimation();
}

function updateCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalElement = document.getElementById('cartTotal');
    const countElement = document.getElementById('cartCount');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Your collection awaits</p>
            </div>
        `;
        totalElement.textContent = '$0';
        countElement.textContent = '0';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-header">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString()}</div>
            </div>
            <div class="cart-item-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `$${total.toLocaleString()}`;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems;
}

function changeQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your collection is empty!', 'error');
        return;
    }
    
    openCheckoutModal();
}

// ====================================
// Checkout Modal Functions
// ====================================
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Your collection is empty!', 'error');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const itemsList = document.getElementById('checkoutItemsList');
    const subtotalElement = document.getElementById('checkoutSubtotal');
    const finalTotalElement = document.getElementById('checkoutFinalTotal');
    
    // Populate items
    itemsList.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div>
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-qty">Quantity: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">$${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const authFee = 500;
    const shippingFee = 250;
    const finalTotal = subtotal + authFee + shippingFee;
    
    subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
    finalTotalElement.textContent = `$${finalTotal.toLocaleString()}`;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function confirmCheckout() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = subtotal + 750; // Auth + Shipping
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Generate order number
    const orderNumber = 'ANT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Close checkout modal
    closeCheckoutModal();
    
    // Clear cart
    cart = [];
    updateCart();
    saveCartToStorage();
    closeCart();
    
    // Show confirmation modal
    setTimeout(() => {
        showConfirmationModal(orderNumber, itemCount, finalTotal);
    }, 300);
}

// ====================================
// Confirmation Modal Functions
// ====================================
function showConfirmationModal(orderNumber, itemCount, total) {
    const modal = document.getElementById('confirmationModal');
    const orderNumberElement = document.getElementById('orderNumber');
    
    orderNumberElement.textContent = orderNumber;
    
    modal.classList.add('active');
    
    // Confetti effect (simple version)
    createConfetti();
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function createConfetti() {
    const colors = ['#d4af37', '#cd7f32', '#f4e4c1'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.zIndex = '7000';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const duration = Math.random() * 3000 + 2000;
        const endLeft = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 100;
        
        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => confetti.remove(), duration);
    }
}

// ====================================
// Cart Toggle Functions
// ====================================
function setupCartToggle() {
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
    
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.body.style.overflow = '';
}

// ====================================
// Local Storage Functions
// ====================================
function saveCartToStorage() {
    localStorage.setItem('antiqua-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('antiqua-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// ====================================
// Theme Toggle Functions
// ====================================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeLabel.textContent = 'Dark Mode';
        localStorage.setItem('antiqua-theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeLabel.textContent = 'Light Mode';
        localStorage.setItem('antiqua-theme', 'dark');
    }
}

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('antiqua-theme');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeLabel.textContent = 'Light Mode';
    }
}

// ====================================
// Animation Functions
// ====================================
function showAddToCartAnimation() {
    const badge = document.getElementById('cartCount');
    badge.style.animation = 'none';
    
    setTimeout(() => {
        badge.style.animation = 'cartBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);
}

function setupScrollAnimations() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Don't prevent default for cart toggle
            if (href === '#' || this.id === 'cartToggle') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            const parallaxSpeed = 0.5;
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// ====================================
// Toast Notification System
// ====================================
function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${iconClass} toast-icon ${type}"></i>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ====================================
// Add to Cart with Visual Feedback
// ====================================
function showAddToCartAnimation() {
    const badge = document.getElementById('cartCount');
    const cartIcon = document.getElementById('cartToggle');
    
    // Bounce animation on badge
    badge.style.animation = 'none';
    setTimeout(() => {
        badge.style.animation = 'cartBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);
    
    // Create flying icon
    const flyingIcon = document.createElement('div');
    flyingIcon.className = 'cart-add-animation';
    flyingIcon.innerHTML = '<i class="fas fa-shopping-cart" style="color: var(--gold);"></i>';
    
    // Position it at center of viewport
    flyingIcon.style.left = '50%';
    flyingIcon.style.top = '50%';
    
    document.body.appendChild(flyingIcon);
    
    // Get cart icon position
    const cartRect = cartIcon.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // Animate to cart
    flyingIcon.animate([
        { left: '50%', top: '50%' },
        { left: endX + 'px', top: endY + 'px' }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
    
    setTimeout(() => flyingIcon.remove(), 800);
    
    // Show toast notification
    showToast('Added to your collection!', 'success');
}

// ====================================
// Utility Functions
// ====================================
// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Debounce function for performance
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

// ====================================
// Performance Optimization
// ====================================
// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all product images
    setTimeout(() => {
        document.querySelectorAll('.product-img').forEach(img => {
            imageObserver.observe(img);
        });
    }, 100);
}

// ====================================
// Console Easter Egg
// ====================================
console.log('%c⚱ ANTIQUA', 'font-size: 3rem; font-weight: bold; color: #d4af37; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%cWelcome, collector. May you find treasures beyond measure.', 'font-size: 1.2rem; color: #9a8b7a; font-style: italic;');
console.log('%cEst. 1842', 'font-size: 0.9rem; color: #d4af37; letter-spacing: 3px;');

// ====================================
// Add Required Animations
// ====================================
const style = document.createElement('style');
style.textContent = `
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.3); }
        50% { transform: scale(0.9); }
        75% { transform: scale(1.2); }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);