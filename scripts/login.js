document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("login-form");
    form.addEventListener("submit", function(event) {
      event.preventDefault(); // Empêche l'envoi du formulaire par défaut
  
      var password = document.getElementById("password").value;
  
      // Vérifiez le mot de passe ici
      if (password === "titi") {
        // Stock localement la variable isLogged 
        localStorage.setItem("isLogged", true)
        // Redirection vers la nouvelle page
        window.location.href = "../html/popup.html";
      }
    });
  });