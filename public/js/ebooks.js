// ebooks.js

// Variable global para almacenar el estado del usuario administrador.
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// Cuando el documento esté listo, carga los libros y configura la interacción si el usuario es un admin.
$(document).ready(function() {
    cargarLibros();
    if (isAdmin) {
        configurarDropArea();
    }
});

// Configura el área de arrastre y soltado solo si el usuario es un administrador.
function configurarDropArea() {
    let dropArea = document.getElementById('drop-area');
    if (isAdmin) {
        dropArea.style.display = 'block';  // Asegúrate de que el área de arrastre se muestre solo para admins
    } else {
        dropArea.style.display = 'none';  // Oculta el área de arrastre para usuarios no administradores
    }

    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaultBehavior, false);
    });

    dropArea.addEventListener('dragover', highlightDropArea, false);
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlightDropArea, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
}

function highlightDropArea() {
    dropArea.classList.add('dragover');
}

function unhighlightDropArea() {
    dropArea.classList.remove('dragover');
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
            cargarLibros(); // Recargar la lista de libros
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
                            <button onclick="verLibro('${libro.id}')" target="_blank">Ver</button>
                            ${isAdmin ? `<button onclick="eliminarLibro('${libro.id}')" class="btn btn-danger">Eliminar</button>` : ''}
                        </td>
                    </tr>`;
                tbody.innerHTML += fila;
            });
            configurarDropArea();  // Actualizar el estado del área de arrastre
        },
        error: function() {
            alert("Error al cargar los libros.");
        }
    });
}

function verLibro(idLibro) {
    // Enviar el id del libro al servidor para que lo descargue y lo descomprima
    $.ajax({
        url: `/file/${idLibro}`,
        type: "GET",
        success: function(response) {
            console.log(response);
            mostrarCapitulos(response.capituloUrls);
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al abrir el libro.");
        }
    });
}

function mostrarCapitulos(capituloUrls) {
    const listaCapitulos = document.getElementById('listaCapitulos');
    listaCapitulos.innerHTML = ''; // Limpiar antes de añadir nuevos elementos

    capituloUrls.forEach((url, index) => {
        let listItem = document.createElement('li');
        let link = document.createElement('a');
        link.href = url;
        link.textContent = `Capítulo ${index + 1}`;
        listItem.appendChild(link);
        listaCapitulos.appendChild(listItem);
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
            cargarLibros(); // Recargar los libros
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Error al eliminar el libro.");
        }
    });
}
