// Variable global para almacenar el estado del usuario administrador.
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let dropArea; 
let capitulosUrls = []; 
let indiceCapituloActual = 0; 

// Cuando el documento esté listo, carga los libros y configura la interacción si el usuario es un admin.
$(document).ready(function() {
    cargarLibros();
    dropArea = document.getElementById('drop-area');
    if (isAdmin) {
        configurarDropArea();
    } else {
        dropArea.style.display = 'none';
    }
    $('#btnAnterior').on('click', cargarCapituloAnterior);
    $('#btnSiguiente').on('click', cargarSiguienteCapitulo);
    cargarEstadoGuardado(); // Cargar el estado guardado al iniciar
});

// Configura el área de arrastre y soltado solo si el usuario es un administrador.
function configurarDropArea() {
    if (isAdmin) {
        dropArea.style.display = 'block';  // Muestra el área de arrastre para admins
        ['dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaultBehavior, false);
        });

        dropArea.addEventListener('dragover', highlightDropArea, false);
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlightDropArea, false);
        });

        dropArea.addEventListener('drop', handleDrop, false);
    }
}

function highlightDropArea(event) {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add('dragover');
}

function unhighlightDropArea(event) {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove('dragover');
}

function preventDefaultBehavior(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleDrop(event) {
    preventDefaultBehavior(event);
    let files = event.dataTransfer.files;
    if (files.length) {
        let file = files[0]; // Tomar solo el primer archivo si se sueltan varios
        subirArchivo(file);
    } else {
        console.error('No files were dropped.');
    }
}

function subirArchivo(file) {
    let formData = new FormData();
    formData.append("accio", "cargarEbook");
    formData.append("file", file);
    
    $.ajax({
        url: "/cargarEbook",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log(response);
            cargarLibros(); // Recargar la lista de libros tras la subida
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("El archivo enviado no es un ebook o ha ocurrido un error.");
        }
    });
}

// Función para cargar y mostrar la lista de libros
function cargarLibros() {
    $.ajax({
        url: "/files",
        type: "GET",
        success: function(libros) {
            const tbody = document.getElementById('libros');
            tbody.innerHTML = ''; // Limpiar antes de añadir nuevos elementos
            libros.forEach(libro => {
                let fila = `
                    <tr>
                        <td>${libro.name}</td>
                        <td>
                            <button onclick="verLibro('${libro.id}')" class="btn btn-primary">Ver</button>
                            ${isAdmin ? `<button onclick="eliminarLibro('${libro.id}')" class="btn btn-danger">Eliminar</button>` : ''}
                        </td>
                    </tr>`;
                tbody.innerHTML += fila;
            });
            if (isAdmin) { configurarDropArea(); } // Re-configurar el área de arrastre si es necesario
        },
        error: function() {
            alert("Error al cargar los libros.");
        }
    });
}


function verLibro(idLibro) {
    $.ajax({
        url: `/read-book/${idLibro}`,
        type: "GET",
        success: function(response) {
            capitulosUrls = response.capituloUrls;
            cargarCapituloActual();
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al abrir el libro.");
        }
    });
}

function mostrarCapitulos(urls) {
    capitulosUrls = urls;
    indiceCapituloActual = 0;
    cargarCapituloActual(); 
}

// Función para cargar el capítulo actual en el iframe.
function cargarCapituloActual() {
    const iframe = document.getElementById('lectorCapitulos');
    iframe.src = capitulosUrls[indiceCapituloActual];
    // Guardar estado actual.
    localStorage.setItem('capituloActual', indiceCapituloActual);
    localStorage.setItem('capitulosUrls', JSON.stringify(capitulosUrls));
}

// Función para cargar el estado guardado al volver a abrir la página.
function cargarEstadoGuardado() {
    const urlsGuardadas = JSON.parse(localStorage.getItem('capitulosUrls'));
    const capituloGuardado = localStorage.getItem('capituloActual');
    if (urlsGuardadas && capituloGuardado) {
        capitulosUrls = urlsGuardadas;
        indiceCapituloActual = parseInt(capituloGuardado, 10);
        cargarCapituloActual();
    }
}

function cargarSiguienteCapitulo() {
    if (indiceCapituloActual < capitulosUrls.length - 1) {
        indiceCapituloActual++;
        cargarCapituloActual();
    } else {
        alert("Este es el último capítulo.");
    }
}

// Función para cargar el capítulo anterior
function cargarCapituloAnterior() {
    if (indiceCapituloActual > 0) {
        indiceCapituloActual--;
        cargarCapituloActual();
    } else {
        alert("Este es el primer capítulo.");
    }
}


// Función para eliminar un libro
function eliminarLibro(idLibro) {
    if (!confirm("¿Estás seguro de que quieres eliminar este libro?")) return;

    $.ajax({
        url: `/file/${idLibro}`,
        type: "DELETE",
        success: function(response) {
            alert("Libro eliminado con éxito de Drive.");
            borrarArchivoLocal(idLibro);
            cargarLibros(); 
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al eliminar el libro de Drive.");
        }
    });
}

function borrarArchivoLocal(idLibro) {
    $.ajax({
        url: `/uploads/${idLibro}`, 
        type: "DELETE",
        success: function(response) {
            console.log("Archivo local eliminado con éxito.");
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al eliminar el archivo local.");
        }
    });
}


