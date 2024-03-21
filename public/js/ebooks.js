// Variable global para almacenar el estado del usuario administrador.
let isAdmin = false;

// Establecer el comportamiento del área de arrastre y soltado
let dropArea = document.getElementById('drop-area');

if(dropArea) {
    // Prevenir el comportamiento predeterminado del navegador en eventos de arrastre
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaultBehavior, false);
    });

    // Resaltar el área de arrastre cuando un elemento se arrastra sobre ella
    dropArea.addEventListener('dragover', () => {
        dropArea.classList.add('dragover');
    });

    // Quitar el resaltado cuando el elemento sale del área de arrastre o se suelta
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'));
    });

    // Manejar el evento de soltado
    dropArea.addEventListener('drop', handleDrop, false);
}

function preventDefaultBehavior(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleDrop(event) {
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
            cargarLibros(); // Recargar la lista de libros después de subir un nuevo libro
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
            tbody.innerHTML = ''; // Limpiar la tabla antes de añadir filas nuevas
            libros.forEach(libro => {
                let fila = `<tr>
                                <td>${libro.name}</td>
                                <td>${isAdmin ? `<button onclick="eliminarLibro('${libro.id}')" class="btn btn-danger">Eliminar</button>` : ''}</td>
                            </tr>`;
                tbody.innerHTML += fila;
            });
        },
        error: function() {
            alert("Error al cargar los libros.");
        }
    });
}

// Función para eliminar un libro
function eliminarLibro(idLibro) {
    if (!confirm("¿Estás seguro de que quieres eliminar este libro?")) return;

    $.ajax({
        url: `/file/${idLibro}`,
        type: "DELETE",
        success: function() {
            alert("Libro eliminado con éxito.");
            cargarLibros(); // Recargar los libros después de eliminar
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al eliminar el libro.");
        }
    });
}
