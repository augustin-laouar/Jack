import * as tools from './tools.js';



document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("login-form");
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    var password = document.getElementById("password").value;
    if(await tools.login(password)){
      window.location.href = "../html/emails.html";
    }
    else{
      //todo : print erreur
    }
  });
});