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

        // Check if any files were dropped
        if (event.dataTransfer.files.length === 0) {
            console.error('No files were dropped.');
            return;
        }

        // Obtener el archivo soltado
        let archiu = event.dataTransfer.files[0];
        
        let peticio = new FormData();
        peticio.append("accio", "cargarEbook");
        peticio.append("file", archiu);
        
        $.ajax({
            url: "/cargarEbook",
            method: "POST",
            data: peticio,
            processData: false,
            contentType: false,
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