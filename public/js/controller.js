let login = document.getElementById('btnLogin');

if(login){
    login.addEventListener('click', () => {
        let user = document.getElementById('nameUser').value;
        if(user != ''){
            let peticio = { accio: "login", user: user };
            window.location.href = "view/home.html";
            // $.ajax({
            //     url: "/loginUsuari",
            //     method: "POST",
            //     data: peticio,
            //     success: function(response) {
            //         console.log(response);
            //     },
            //     error: function(xhr, status, error) {
            //         console.error(xhr.responseText);
            //         alert("Error al inseri usuari.");
            //     }
            // });
        }else{
            alert('Ingrese un nombre de usuario');
        }
    });
}