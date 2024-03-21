let login = document.getElementById('btnLogin');

if (login) {
    login.addEventListener('click', () => {
        let user = document.getElementById('nameUser').value;
        let isAdmin = document.getElementById('isAdmin').checked; // Obtiene si el checkbox está marcado
        if (user != '') {
            let peticio = { accio: "login", user: user, isAdmin: isAdmin };
            $.ajax({
                url: "/loginUsuari",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(peticio),
                success: function (response) {
                    // Ocultamos el login-area y mostramos el welcome-area
                    document.getElementById('login-area').style.display = 'none';
                    let welcomeArea = document.getElementById('welcome-area');
                    document.getElementById('welcome-message').textContent = 'Bienvenido/a, ' + user + (isAdmin ? ' (Admin)' : '');
                    welcomeArea.style.display = 'block';
                    if (!isAdmin) {
                        document.getElementById('drop-area').style.display = 'none';
                    } else {
                        document.getElementById('drop-area').style.display = 'block';
                    }
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
        document.getElementById('welcome-area').style.display = 'none';
        document.getElementById('login-area').style.display = 'block';
    });
}

