import * as pswTools from './password_tools.js';


document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    var pwdForm = document.getElementById("pwdForm");
    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      var id = document.getElementById("identifiant");
      var pwd = document.getElementById("motDePasse");
      console.log(id.value + pwd.value);
      pswTools.storeLogs('test2.com',id.value, pwd.value);
      id.value = '';
      pwd.value = '';
    });
});