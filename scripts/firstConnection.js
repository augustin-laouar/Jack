import * as tools from './tools.js';

document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("create-psw-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;
      if(password !== confirm){
        //afficher erreur
        return;
      }
      try{
        await tools.storeHashedPassword(password);
        tools.storeConnexionDuration(3);
        window.location.href = "../html/login.html";
      }
      catch(error){
        //todo
      }
    });
  });