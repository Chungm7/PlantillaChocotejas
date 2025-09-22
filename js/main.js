document.addEventListener('DOMContentLoaded', function() {
    console.log('El DOM ha sido cargado.');

    // Initialize cart from sessionStorage
    cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    updateCartIcon();

    if (document.getElementById('product-gallery')) {
        initializeProductsPage();
    }
    if (document.getElementById('featured-product-gallery')) {
        displayFeaturedProducts();
    }
    if (document.getElementById('cartModal')) {
        // Attach listener to checkout button inside the cart
        document.getElementById('checkout-button').addEventListener('click', () => {
            if (cart.length > 0) {
                const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
                cartModal.hide();
                const customerFormModal = new bootstrap.Modal(document.getElementById('customerFormModal'));
                customerFormModal.show();
            } else {
                showToast('Tu carrito está vacío.');
            }
        });
    }

    // Attach listener to the customer details form
    const customerForm = document.getElementById('customer-form');
    if(customerForm) {
        customerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            generateWhatsAppMessage();
        });
    }
});

let cart = [];

/**
 * Shows a toast notification with a given message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
    const toastBody = document.getElementById('toast-body-content');
    toastBody.textContent = message;
    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
}

function generateWhatsAppMessage() {
    const businessPhoneNumber = '51987654321'; // Replace with the actual business number

    const name = document.getElementById('fullName').value;
    const address = document.getElementById('address').value;
    const reference = document.getElementById('reference').value;
    const phone = document.getElementById('phone').value;

    let message = `¡Hola! Quisiera realizar el siguiente pedido:\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Dirección:* ${address}\n`;
    if (reference) {
        message += `*Referencia:* ${reference}\n`;
    }
    message += `*Teléfono:* ${phone}\n\n`;
    message += `*Productos:*\n`;

    let total = 0;
    cart.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - S/ ${(item.quantity * item.price).toFixed(2)}\n`;
        total += item.quantity * item.price;
    });

    message += `\n*Total a Pagar:* S/ ${total.toFixed(2)}\n\n`;
    message += `¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    cart = [];
    saveCart();
    updateCartIcon();
    const customerFormModal = bootstrap.Modal.getInstance(document.getElementById('customerFormModal'));
    customerFormModal.hide();
    showToast('¡Pedido enviado! Serás redirigido a WhatsApp para confirmar.');
}

function displayFeaturedProducts() {
    const featuredGallery = document.getElementById('featured-product-gallery');
    const featuredProducts = products.slice(0, 4);

    featuredProducts.forEach(product => {
        const productCard = `
            <div class="col">
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text mt-auto"><strong>Precio: S/ ${product.price.toFixed(2)}</strong></p>
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Añadir al carrito</button>
                    </div>
                </div>
            </div>
        `;
        featuredGallery.innerHTML += productCard;
    });
}

function initializeProductsPage() {
    const allProducts = products;
    displayProducts(allProducts);
    populateCategoryFilters(allProducts);

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('price-value');

    searchButton.addEventListener('click', () => applyFilters(allProducts));
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            applyFilters(allProducts);
        }
    });
    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
        applyFilters(allProducts);
    });
}

function applyFilters(allProducts) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const maxPrice = parseFloat(document.getElementById('priceRange').value);
    const selectedCategory = document.querySelector('#category-filters .list-group-item.active')?.dataset.category || 'All';

    let filteredProducts = allProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);

    if (selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    displayProducts(filteredProducts);
}

function populateCategoryFilters(allProducts) {
    const filtersContainer = document.getElementById('category-filters');
    const categories = ['All', ...new Set(allProducts.map(p => p.category))];

    categories.forEach(category => {
        const filterButton = document.createElement('a');
        filterButton.href = '#';
        filterButton.className = 'list-group-item list-group-item-action';
        if (category === 'All') {
            filterButton.classList.add('active');
        }
        filterButton.dataset.category = category;
        filterButton.textContent = category;

        filterButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#category-filters .list-group-item.active').classList.remove('active');
            e.target.classList.add('active');
            applyFilters(allProducts);
        });

        filtersContainer.appendChild(filterButton);
    });
}

function displayProducts(productList) {
    const gallery = document.getElementById('product-gallery');
    gallery.innerHTML = '';

    if (productList.length === 0) {
        gallery.innerHTML = '<p class="text-center">No se encontraron productos que coincidan con su búsqueda.</p>';
        return;
    }

    productList.forEach(product => {
        const productCard = `
            <div class="col">
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text mt-auto"><strong>Precio: S/ ${product.price.toFixed(2)}</strong></p>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Añadir al carrito</button>
                    </div>
                </div>
            </div>
        `;
        gallery.innerHTML += productCard;
    });
}

// --- Shopping Cart Logic ---

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartIcon();
    updateCartModal();
    showToast(`"${product.name}" ha sido añadido al carrito.`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartIcon();
    updateCartModal();
}

function updateQuantity(productId, quantity) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity = quantity;
    }
    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartIcon();
        updateCartModal();
    }
}

function saveCart() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartModal() {
    const modalBody = document.getElementById('cart-modal-body');
    if (cart.length === 0) {
        modalBody.innerHTML = '<p>Tu carrito está vacío.</p>';
        return;
    }

    let itemsHtml = '<ul class="list-group">';
    let total = 0;
    cart.forEach(item => {
        itemsHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">Precio: S/ ${item.price.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center">
                    <input type="number" value="${item.quantity}" min="1" class="form-control" style="width: 60px;" onchange="updateQuantity(${item.id}, this.valueAsNumber)">
                    <span class="text-muted mx-2">S/ ${(item.quantity * item.price).toFixed(2)}</span>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">X</button>
                </div>
            </li>
        `;
        total += item.quantity * item.price;
    });
    itemsHtml += `
        <li class="list-group-item d-flex justify-content-between">
            <span>Total (S/)</span>
            <strong>S/ ${total.toFixed(2)}</strong>
        </li>
    `;
    itemsHtml += '</ul>';

    modalBody.innerHTML = itemsHtml;
}
