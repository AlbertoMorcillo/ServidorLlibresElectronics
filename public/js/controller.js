let login = document.getElementById('btnLogin');

if(login){
    login.addEventListener('click', () => {
        let user = document.getElementById('nameUser').value;
        if(user != ''){
            let peticio = { accio: "login", user: user };
            $.ajax({
                url: "/loginUsuari",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(peticio),
                success: function(response) {
                    if(response.accio == "urlHome"){
                        window.location.href = response.url;
                    }
                },
                error: function(xhr, status, error) {
                    console.error(xhr.responseText);
                    alert("Error al insertar usuario.");
                }
            });
            
        }else{
            alert('Ingrese un nombre de usuario');
        }
    });
}