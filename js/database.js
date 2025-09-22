// --- SIMULACIÓN DE BASE DE DATOS ---
// En un proyecto real, estos datos vendrían de una API.
// Para este ejercicio, usaremos localStorage para persistir la información.

// Inicializamos los datos solo si no existen en localStorage
function inicializarDatos() {
    const productosEnStorage = localStorage.getItem('productos');
    if (!productosEnStorage) {
        const productosIniciales = [
            {
                id: 1,
                nombre: 'Chocoteja Clásica',
                descripcion: 'Rellena del más puro manjar blanco de la casa.',
                precio: 2.50,
                stock: 50,
                categoria: 'Clásicos',
                imagen: 'assets/img/chocoteja-clasica.jpg'
            },
            {
                id: 2,
                nombre: 'Chocoteja de Pecanas',
                descripcion: 'Manjar blanco con pecanas tostadas y cubertura de chocolate de leche.',
                precio: 3.00,
                stock: 40,
                categoria: 'Nueces',
                imagen: 'assets/img/chocoteja-pecanas.jpg'
            },
            {
                id: 3,
                nombre: 'Chocoteja de Coco',
                descripcion: 'Relleno de dulce de coco y cubierto con chocolate blanco.',
                precio: 3.00,
                stock: 35,
                categoria: 'Frutas',
                imagen: 'assets/img/chocoteja-coco.jpg'
            },
            {
                id: 4,
                nombre: 'Chocoteja de Menta',
                descripcion: 'Crema de menta refrescante con cobertura de chocolate bitter.',
                precio: 3.50,
                stock: 20,
                categoria: 'Especiales',
                imagen: 'assets/img/chocoteja-menta.jpg'
            },
            {
                id: 5,
                nombre: 'Chocoteja de Lúcuma',
                descripcion: 'Manjar de lúcuma fresca y natural, un sabor que te encantará.',
                precio: 3.50,
                stock: 25,
                categoria: 'Frutas',
                imagen: 'assets/img/chocoteja-lucuma.jpg'
            },
             {
                id: 6,
                nombre: 'Chocoteja de Café',
                descripcion: 'Intenso sabor a café en un relleno cremoso con chocolate al 70%.',
                precio: 3.50,
                stock: 30,
                categoria: 'Especiales',
                imagen: 'assets/img/chocoteja-cafe.jpg'
            }
        ];
        localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }

    const usuariosEnStorage = localStorage.getItem('usuarios');
    if (!usuariosEnStorage) {
        const usuariosIniciales = [
            {
                id: 1,
                username: 'admin',
                password: 'admin', // En un caso real, esto estaría encriptado
                nombreCompleto: 'Administrador Principal',
                perfil: 'Administrador',
                activo: true
            },
            {
                id: 2,
                username: 'vendedor',
                password: 'vendedor',
                nombreCompleto: 'Juan Pérez',
                perfil: 'Ventas',
                activo: true
            }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuariosIniciales));
    }

    const perfilesEnStorage = localStorage.getItem('perfiles');
    if(!perfilesEnStorage) {
        const perfilesIniciales = [
            {
                id: 1,
                nombre: 'Administrador',
                permisos: ['gestion-productos', 'gestion-usuarios', 'gestion-perfiles', 'gestion-ventas'],
                activo: true
            },
            {
                id: 2,
                nombre: 'Ventas',
                permisos: ['gestion-ventas'],
                activo: true
            }
        ];
        localStorage.setItem('perfiles', JSON.stringify(perfilesIniciales));
    }

    const pedidosEnStorage = localStorage.getItem('pedidos');
    if(!pedidosEnStorage){
        localStorage.setItem('pedidos', JSON.stringify([]));
    }
}

// --- API de Acceso a Datos ---

// Productos
const getProductos = () => JSON.parse(localStorage.getItem('productos')) || [];
const saveProductos = (productos) => localStorage.setItem('productos', JSON.stringify(productos));

// Usuarios
const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
const saveUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));

// Perfiles
const getPerfiles = () => JSON.parse(localStorage.getItem('perfiles')) || [];
const savePerfiles = (perfiles) => localStorage.setItem('perfiles', JSON.stringify(perfiles));

// Pedidos
const getPedidos = () => JSON.parse(localStorage.getItem('pedidos')) || [];
const savePedidos = (pedidos) => localStorage.setItem('pedidos', JSON.stringify(pedidos));


// Inicializamos los datos al cargar el script
inicializarDatos();
