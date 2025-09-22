// Lógica para la autenticación de usuarios
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const usuarios = getUsuarios(); // Función de database.js
            const usuarioValido = usuarios.find(u => u.username === username && u.password === password && u.activo);

            if (usuarioValido) {
                // Guardar sesión en sessionStorage para que se borre al cerrar la pestaña
                sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuarioValido));
                window.location.href = 'gestion-productos.html'; // Redirigir al panel principal
            } else {
                // Mostrar notificación de error
                showToast('Usuario o contraseña incorrectos, o la cuenta está inactiva.', 'danger');
            }
        });
    }
});
