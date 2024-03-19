// Obtener el área de drop
let dropArea = document.getElementById('drop-area');

if(dropArea){
    // Función para prevenir el comportamiento predeterminado del navegador en eventos dragover y drop
    function preventDefaultBehavior(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Evento dragover: se dispara cuando un elemento se arrastra sobre el área de drop
    dropArea.addEventListener('dragover', function(event) {
        preventDefaultBehavior(event);
        dropArea.classList.add('dragover');
    });

    // Evento dragleave: se dispara cuando un elemento sale del área de drop
    dropArea.addEventListener('dragleave', function(event) {
        preventDefaultBehavior(event);
        dropArea.classList.remove('dragover');
    });

    // Evento drop: se dispara cuando se suelta un elemento sobre el área de drop
    dropArea.addEventListener('drop', function(event) {
        preventDefaultBehavior(event);
        dropArea.classList.remove('dragover');

        // Obtener el archivo soltado
        let file = event.dataTransfer.files[0];
        
        console.log('Archivo soltado:', file.name);
        //enviar archivo al servidor
        let peticio = { accio: "cargarEbook", file: file };
        $.ajax({
            url: "/cargarEbook",
            method: "POST",
            data: peticio,
            success: function(response) {
                console.log(response);
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
                alert("L'arxiu enviat no es un ebook o hi ha hagut un error.");
            }
        });
    });
}