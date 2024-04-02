let login = document.getElementById('btnLogin');

if (login) {
    login.addEventListener('click', () => {
        let user = document.getElementById('nameUser').value;
        let isAdminCheckbox = document.getElementById('isAdmin').checked;
        if (user != '') {
            let peticio = { accio: "login", user: user, isAdmin: isAdminCheckbox };
            $.ajax({
                url: "/loginUsuari",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(peticio),
                success: function (response) {
                    // Guardar en localStorage el estado de administrador
                    localStorage.setItem('isAdmin', response.isAdmin);
                    // Actualizar la variable global isAdmin
                    isAdmin = response.isAdmin;
                    
                    // Ocultamos el login-area y mostramos el welcome-area
                    document.getElementById('login-area').style.display = 'none';
                    let welcomeArea = document.getElementById('welcome-area');
                    document.getElementById('welcome-message').textContent = 'Bienvenido/a, ' + user + (response.isAdmin ? ' (Admin)' : '');
                    welcomeArea.style.display = 'block';

                    // Llamar a cargarLibros para mostrar la lista de libros
                    cargarLibros();
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                    alert("Error al insertar usuario.");
                }
            });
        } else {
            alert('Ingrese un nombre de usuario');
        }
    });
}

let btnGoBack = document.getElementById('btnGoBack');

if (btnGoBack) {
    btnGoBack.addEventListener('click', () => {
        localStorage.removeItem('isAdmin');
        isAdmin = false;
        document.getElementById('welcome-area').style.display = 'none';
        document.getElementById('login-area').style.display = 'block';
    });
}

// Asegúrate de que cargarLibros esté definido en este archivo o incluido antes de este script.
