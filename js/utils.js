// --- SISTEMA DE NOTIFICACIONES (TOASTS) ---

function showToast(message, type = 'info') {
    // Crear el elemento toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Añadirlo al contenedor de toasts
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    toastContainer.appendChild(toastEl);

    // Inicializar y mostrar el toast de Bootstrap
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Opcional: eliminar el elemento del DOM después de que se oculte
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// --- NOTIFICACIÓN DE NUEVOS PEDIDOS ---

window.addEventListener('storage', (event) => {
    if (event.key === 'pedidos' && window.location.pathname.includes('/gestion/')) {
        const oldPedidos = JSON.parse(event.oldValue || '[]');
        const newPedidos = JSON.parse(event.newValue || '[]');

        if (newPedidos.length > oldPedidos.length) {
             // Comprobar si el usuario tiene permiso para ver ventas
            const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
            if (usuarioLogueado) {
                const perfiles = getPerfiles();
                const perfilUsuario = perfiles.find(p => p.nombre === usuarioLogueado.perfil);
                if (perfilUsuario && perfilUsuario.permisos.includes('gestion-ventas')) {
                    showToast('¡Nuevo pedido recibido! Recarga la página de ventas para verlo.', 'success');
                }
            }
        }
    }
});
