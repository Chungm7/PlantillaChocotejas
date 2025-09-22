// Lógica principal para la capa de cliente (público)

// --- CARRITO DE COMPRAS ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const products = getProductos();
    const productToAdd = products.find(p => p.id === productId);

    if (productToAdd) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        saveCart();
        showToast(`${productToAdd.nombre} ha sido añadido al carrito.`, 'success');
        renderCart(); // Actualizar la vista del carrito
    }
}

// --- RENDERIZADO DE COMPONENTES ---

function renderProductCard(product) {
    // Usamos una imagen de placeholder si la del producto no existe
    const imageSrc = product.imagen || 'https://placehold.co/600x400/5D4037/FFF8E1?text=Chocoteja';
    return `
        <div class="col">
            <div class="card product-card h-100">
                <img src="${imageSrc}" class="card-img-top" alt="${product.nombre}">
                <div class="card-body product-card-body">
                    <h5 class="card-title">${product.nombre}</h5>
                    <p class="card-text">${product.descripcion}</p>
                    <p class="price">S/ ${product.precio.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Añadir al Carrito</button>
                </div>
            </div>
        </div>
    `;
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        cartEmptyMsg.style.display = 'block';
        cartTotalEl.textContent = 'S/ 0.00';
    } else {
        cartEmptyMsg.style.display = 'none';
        cartContainer.innerHTML = cart.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.nombre} (x${item.quantity})</span>
                <span>S/ ${(item.precio * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
        cartTotalEl.textContent = `S/ ${total.toFixed(2)}`;
    }
}


// --- LÓGICA DE PÁGINA ---

document.addEventListener('DOMContentLoaded', () => {
    const featuredProductsContainer = document.getElementById('productos-destacados-container');
    const productGalleryContainer = document.getElementById('product-gallery-container');

    // Event listener global para los botones "Añadir al carrito"
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.productId);
            addToCart(productId);
        }
    });

    // --- PÁGINA DE INICIO ---
    if (featuredProductsContainer) {
        const products = getProductos();
        const featuredProducts = products.slice(0, 3); // Mostramos los 3 primeros como destacados
        featuredProductsContainer.innerHTML = featuredProducts.map(renderProductCard).join('');
    }

    // --- PÁGINA DE PRODUCTOS ---
    if (productGalleryContainer) {
        let allProducts = getProductos();

        const searchInput = document.getElementById('search-input');
        const categoryFiltersContainer = document.getElementById('category-filters');
        const priceRange = document.getElementById('price-range');
        const priceValue = document.getElementById('price-value');

        function populateFilters() {
            const categories = [...new Set(allProducts.map(p => p.categoria))];
            categoryFiltersContainer.innerHTML = categories.map(cat => `
                <div class="form-check">
                    <input class="form-check-input category-filter" type="checkbox" value="${cat}" id="cat-${cat}">
                    <label class="form-check-label" for="cat-${cat}">${cat}</label>
                </div>
            `).join('');

            const maxPrice = Math.ceil(Math.max(...allProducts.map(p => p.precio)));
            priceRange.max = maxPrice;
            priceRange.value = maxPrice;
            priceValue.textContent = `S/ ${maxPrice.toFixed(2)}`;
        }

        function applyFilters() {
            const searchTerm = searchInput.value.toLowerCase();

            const selectedCategories = [...document.querySelectorAll('.category-filter:checked')].map(el => el.value);

            const maxPrice = parseFloat(priceRange.value);
            priceValue.textContent = `S/ ${maxPrice.toFixed(2)}`;

            let filteredProducts = allProducts.filter(product => {
                const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) || product.descripcion.toLowerCase().includes(searchTerm);
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.categoria);
                const matchesPrice = product.precio <= maxPrice;
                return matchesSearch && matchesCategory && matchesPrice;
            });

            renderProductGallery(filteredProducts);
        }

        function renderProductGallery(products) {
            if (products.length === 0) {
                productGalleryContainer.innerHTML = '<p class="text-center">No se encontraron productos que coincidan con su búsqueda.</p>';
            } else {
                productGalleryContainer.innerHTML = products.map(renderProductCard).join('');
            }
        }

        // Inicialización
        populateFilters();
        renderProductGallery(allProducts);
        renderCart();

        // Event Listeners
        searchInput.addEventListener('input', applyFilters);
        priceRange.addEventListener('input', applyFilters);
        categoryFiltersContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-filter')) {
                applyFilters();
            }
        });

        // Lógica del Formulario de Pedido
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (cart.length === 0) {
                    showToast('Tu carrito está vacío. Añade productos para continuar.', 'warning');
                    return;
                }

                const nombre = document.getElementById('nombre').value;
                const direccion = document.getElementById('direccion').value;
                const referencia = document.getElementById('referencia').value;
                const telefono = document.getElementById('telefono').value;

                let mensaje = `¡Hola ChocoSabor! Quisiera realizar el siguiente pedido:\n\n`;
                mensaje += `*Cliente:* ${nombre}\n`;
                mensaje += `*Dirección de Entrega:* ${direccion}\n`;
                if(referencia) mensaje += `*Referencia:* ${referencia}\n`;
                mensaje += `*Teléfono:* ${telefono}\n\n`;
                mensaje += `*Productos:*\n`;

                cart.forEach(item => {
                    mensaje += `- ${item.nombre} (x${item.quantity}) - S/ ${(item.precio * item.quantity).toFixed(2)}\n`;
                });

                const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
                mensaje += `\n*Total del Pedido:* S/ ${total.toFixed(2)}\n\n`;
                mensaje += `Quedo a la espera de su confirmación para coordinar el pago y la entrega. ¡Gracias!`;

                // Guardar el pedido en localStorage para la capa de gestión
                const pedidos = getPedidos();
                const nuevoPedido = {
                    id: Date.now(),
                    cliente: { nombre, direccion, referencia, telefono },
                    items: cart,
                    total: total,
                    estado: 'emitido',
                    fecha: new Date().toISOString()
                };
                pedidos.push(nuevoPedido);
                savePedidos(pedidos);

                // Limpiar carrito y formulario
                cart = [];
                saveCart();
                renderCart();
                orderForm.reset();

                // Redirigir a WhatsApp
                const numeroWhatsApp = '51987654321'; // Reemplazar con el número real
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;

                window.open(urlWhatsApp, '_blank');

                showToast('¡Pedido enviado! Revisa WhatsApp para continuar.', 'info');
            });
        }
    }
});
