// Lógica principal para la capa de gestión (privada)

document.addEventListener('DOMContentLoaded', () => {
    // --- AUTENTICACIÓN Y NAVEGACIÓN ---
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    const currentPage = window.location.pathname;

    if (!usuarioLogueado && !currentPage.endsWith('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('usuarioLogueado');
            window.location.href = 'login.html';
        });
    }

    // --- GESTIÓN DE PRODUCTOS ---
    if (currentPage.endsWith('gestion-productos.html')) {
        const productContainer = document.getElementById('product-management-container');
        const productModal = new bootstrap.Modal(document.getElementById('product-modal'));
        const productForm = document.getElementById('product-form');
        const productModalLabel = document.getElementById('productModalLabel');

        const idInput = document.getElementById('product-id');
        const nameInput = document.getElementById('product-name');
        const descriptionInput = document.getElementById('product-description');
        const imageInput = document.getElementById('product-image');
        const priceInput = document.getElementById('product-price');
        const stockInput = document.getElementById('product-stock');
        const categoryInput = document.getElementById('product-category');

        function renderAdminProductCard(product) {
            return `
                <div class="col-md-4 col-lg-3">
                    <div class="card product-card-admin">
                        <img src="../${product.imagen || 'assets/img/placeholder.jpg'}" alt="${product.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${product.nombre}</h5>
                            <p class="card-text">S/ ${product.precio.toFixed(2)} | Stock: ${product.stock}</p>
                        </div>
                        <button class="btn edit-btn" data-product-id="${product.id}" data-bs-toggle="modal" data-bs-target="#product-modal"><i class="bi bi-pencil"></i></button>
                         <button class="btn btn-danger delete-btn" data-product-id="${product.id}" style="position: absolute; bottom: 10px; right: 10px;"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
        }

        function loadProducts() {
            const products = getProductos();
            productContainer.innerHTML = products.map(renderAdminProductCard).join('');
        }

        document.getElementById('add-product-btn').addEventListener('click', () => {
            productModalLabel.textContent = 'Crear Nuevo Producto';
            productForm.reset();
            idInput.value = '';
        });

        productContainer.addEventListener('click', e => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                productModalLabel.textContent = 'Editar Producto';
                const productId = editBtn.dataset.productId;
                const products = getProductos();
                const product = products.find(p => p.id == productId);

                idInput.value = product.id;
                nameInput.value = product.nombre;
                descriptionInput.value = product.descripcion;
                imageInput.value = product.imagen;
                priceInput.value = product.precio;
                stockInput.value = product.stock;
                categoryInput.value = product.categoria;
            }

            if(deleteBtn){
                if(confirm('¿Estás seguro de que quieres eliminar este producto?')){
                    const productId = deleteBtn.dataset.productId;
                    let products = getProductos();
                    products = products.filter(p => p.id != productId);
                    saveProductos(products);
                    loadProducts();
                }
            }
        });

        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let products = getProductos();
            const productId = idInput.value;

            const productData = {
                nombre: nameInput.value,
                descripcion: descriptionInput.value,
                imagen: imageInput.value,
                precio: parseFloat(priceInput.value),
                stock: parseInt(stockInput.value),
                categoria: categoryInput.value,
            };

            if (productId) { // Editar
                products = products.map(p => p.id == productId ? { ...p, ...productData } : p);
            } else { // Crear
                productData.id = Date.now();
                products.push(productData);
            }

            saveProductos(products);
            loadProducts();
            productModal.hide();
        });

        loadProducts();
    }

    // --- GESTIÓN DE VENTAS ---
    if (currentPage.endsWith('gestion-ventas.html')) {
        const salesTableBody = document.getElementById('sales-table-body');
        const generateReportBtn = document.getElementById('generate-report-btn');

        const estados = ['emitido', 'pagado', 'en proceso de entrega', 'finalizado'];

        function renderSales() {
            const pedidos = getPedidos();
            if (pedidos.length === 0) {
                salesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos registrados.</td></tr>';
                return;
            }
            salesTableBody.innerHTML = pedidos.map(pedido => `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${new Date(pedido.fecha).toLocaleString()}</td>
                    <td>${pedido.cliente.nombre}</td>
                    <td>S/ ${pedido.total.toFixed(2)}</td>
                    <td>
                        <select class="form-select form-select-sm status-select" data-order-id="${pedido.id}">
                            ${estados.map(estado => `<option value="${estado}" ${pedido.estado === estado ? 'selected' : ''}>${estado.charAt(0).toUpperCase() + estado.slice(1)}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info view-details-btn" data-order-id="${pedido.id}"><i class="bi bi-eye"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        salesTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('status-select')) {
                const orderId = e.target.dataset.orderId;
                const newStatus = e.target.value;
                let pedidos = getPedidos();
                pedidos = pedidos.map(p => p.id == orderId ? { ...p, estado: newStatus } : p);
                savePedidos(pedidos);
                showToast(`Estado del pedido actualizado a "${newStatus}".`, 'success');
            }
        });

        generateReportBtn.addEventListener('click', () => {
            const pedidos = getPedidos();
            const totalVendido = pedidos.reduce((sum, p) => p.estado === 'pagado' || p.estado === 'finalizado' ? sum + p.total : sum, 0);
            const totalPedidos = pedidos.length;
            const pedidosFinalizados = pedidos.filter(p => p.estado === 'finalizado').length;

            showToast(
`Reporte: ${totalPedidos} pedidos, ${pedidosFinalizados} finalizados. Total: S/ ${totalVendido.toFixed(2)}`, 'info'
            );
        });

        renderSales();
    }

    // --- GESTIÓN DE USUARIOS ---
    if (currentPage.endsWith('gestion-usuarios.html')) {
        const usersTableBody = document.getElementById('users-table-body');
        const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
        const userForm = document.getElementById('user-form');
        const userModalLabel = document.getElementById('userModalLabel');
        const profileSelect = document.getElementById('user-profile');

        function loadUsers() {
            const usuarios = getUsuarios();
            usersTableBody.innerHTML = usuarios.map((user, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.nombreCompleto}</td>
                    <td>${user.perfil}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input status-switch" type="checkbox" role="switch" id="user-status-${user.id}" data-user-id="${user.id}" ${user.activo ? 'checked' : ''}>
                            <label class="form-check-label" for="user-status-${user.id}">${user.activo ? 'Activo' : 'Inactivo'}</label>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user-btn" data-user-id="${user.id}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user.id}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        function populateProfileOptions() {
            const perfiles = getPerfiles();
            profileSelect.innerHTML = perfiles.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
        }

        document.getElementById('add-user-btn').addEventListener('click', () => {
            userModalLabel.textContent = 'Crear Nuevo Usuario';
            userForm.reset();
            document.getElementById('user-id').value = '';
            document.getElementById('user-password').required = true;
            userModal.show();
        });

        usersTableBody.addEventListener('click', e => {
            const userId = e.target.closest('button')?.dataset.userId;
            if (!userId) return;

            if (e.target.closest('.edit-user-btn')) {
                userModalLabel.textContent = 'Editar Usuario';
                const usuarios = getUsuarios();
                const user = usuarios.find(u => u.id == userId);

                document.getElementById('user-id').value = user.id;
                document.getElementById('user-username').value = user.username;
                document.getElementById('user-fullname').value = user.nombreCompleto;
                document.getElementById('user-profile').value = user.perfil;
                document.getElementById('user-password').value = '';
                document.getElementById('user-password').required = false;

                userModal.show();
            }

            if (e.target.closest('.delete-user-btn')) {
                if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                    let usuarios = getUsuarios();
                    usuarios = usuarios.filter(u => u.id != userId);
                    saveUsuarios(usuarios);
                    loadUsers();
                }
            }
        });

        userForm.addEventListener('submit', e => {
            e.preventDefault();
            const userId = document.getElementById('user-id').value;
            let usuarios = getUsuarios();
            const userData = {
                username: document.getElementById('user-username').value,
                nombreCompleto: document.getElementById('user-fullname').value,
                perfil: document.getElementById('user-profile').value,
                activo: userId ? usuarios.find(u => u.id == userId).activo : true
            };

            const password = document.getElementById('user-password').value;
            if (password) {
                userData.password = password; // En un caso real, encriptar
            }

            if (userId) { // Editar
                usuarios = usuarios.map(u => u.id == userId ? { ...u, ...userData } : u);
            } else { // Crear
                userData.id = Date.now();
                usuarios.push(userData);
            }
            saveUsuarios(usuarios);
            loadUsers();
            userModal.hide();
        });

         usersTableBody.addEventListener('change', e => {
            if (e.target.classList.contains('status-switch')) {
                const userId = e.target.dataset.userId;
                let usuarios = getUsuarios();
                const user = usuarios.find(u => u.id == userId);
                if(user) {
                    user.activo = e.target.checked;
                    saveUsuarios(usuarios);
                    loadUsers();
                }
            }
        });

        populateProfileOptions();
        loadUsers();
    }

    // --- GESTIÓN DE PERFILES ---
    if (currentPage.endsWith('gestion-perfiles.html')) {
        const profilesTableBody = document.getElementById('profiles-table-body');
        const profileModal = new bootstrap.Modal(document.getElementById('profile-modal'));
        const profileForm = document.getElementById('profile-form');
        const profileModalLabel = document.getElementById('profileModalLabel');
        const permissionsContainer = document.getElementById('permissions-container');

        const availablePermissions = ['gestion-productos', 'gestion-ventas', 'gestion-usuarios', 'gestion-perfiles'];

        function loadProfiles() {
            const perfiles = getPerfiles();
            profilesTableBody.innerHTML = perfiles.map((p, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.nombre}</td>
                    <td>
                         <div class="form-check form-switch">
                            <input class="form-check-input status-switch" type="checkbox" role="switch" id="profile-status-${p.id}" data-profile-id="${p.id}" ${p.activo ? 'checked' : ''}>
                            <label class="form-check-label" for="profile-status-${p.id}">${p.activo ? 'Activo' : 'Inactivo'}</label>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-profile-btn" data-profile-id="${p.id}"><i class="bi bi-pencil-square"></i> Permisos</button>
                        <button class="btn btn-sm btn-danger delete-profile-btn" data-profile-id="${p.id}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        function renderPermissions(selectedPermissions = []) {
            permissionsContainer.innerHTML = availablePermissions.map(perm => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${perm}" id="perm-${perm}" ${selectedPermissions.includes(perm) ? 'checked' : ''}>
                    <label class="form-check-label" for="perm-${perm}">${perm.replace('gestion-', 'Gestión de ')}</label>
                </div>
            `).join('');
        }

        document.getElementById('add-profile-btn').addEventListener('click', () => {
            profileModalLabel.textContent = 'Crear Nuevo Perfil';
            profileForm.reset();
            document.getElementById('profile-id').value = '';
            renderPermissions();
            profileModal.show();
        });

        profilesTableBody.addEventListener('click', e => {
            const profileId = e.target.closest('button')?.dataset.profileId;
            if (!profileId) return;

            if (e.target.closest('.edit-profile-btn')) {
                profileModalLabel.textContent = 'Editar Perfil y Permisos';
                const perfiles = getPerfiles();
                const profile = perfiles.find(p => p.id == profileId);
                document.getElementById('profile-id').value = profile.id;
                document.getElementById('profile-name').value = profile.nombre;
                renderPermissions(profile.permisos);
                profileModal.show();
            }

            if (e.target.closest('.delete-profile-btn')) {
                 if (confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
                    let perfiles = getPerfiles();
                    perfiles = perfiles.filter(p => p.id != profileId);
                    savePerfiles(perfiles);
                    loadProfiles();
                }
            }
        });

        profileForm.addEventListener('submit', e => {
            e.preventDefault();
            const profileId = document.getElementById('profile-id').value;
            let perfiles = getPerfiles();
            const selectedPermissions = [...permissionsContainer.querySelectorAll('input:checked')].map(el => el.value);

            const profileData = {
                nombre: document.getElementById('profile-name').value,
                permisos: selectedPermissions,
                activo: profileId ? perfiles.find(p => p.id == profileId).activo : true
            };

            if (profileId) { // Editar
                perfiles = perfiles.map(p => p.id == profileId ? { ...p, ...profileData } : p);
            } else { // Crear
                profileData.id = Date.now();
                perfiles.push(profileData);
            }
            savePerfiles(perfiles);
            loadProfiles();
            profileModal.hide();
        });

        profilesTableBody.addEventListener('change', e => {
            if (e.target.classList.contains('status-switch')) {
                const profileId = e.target.dataset.profileId;
                let perfiles = getPerfiles();
                const profile = perfiles.find(p => p.id == profileId);
                if(profile) {
                    profile.activo = e.target.checked;
                    savePerfiles(perfiles);
                    loadProfiles();
                }
            }
        });

        loadProfiles();
    }
});
