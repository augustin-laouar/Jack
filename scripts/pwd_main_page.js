import * as pswTools from './password_tools.js';


document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    var pwdForm = document.getElementById("pwdForm");
    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      var id = document.getElementById("identifiant");
      var pwd = document.getElementById("motDePasse");
      var url = document.getElementById("url");
      console.log(id.value + pwd.value);
      pswTools.storeLogs(url.value,id.value, pwd.value);
      id.value = '';
      pwd.value = '';
      url.value = '';
    });

    var keyGen = document.getElementById("genKey");
    keyGen.addEventListener("click",async function(event){
      var key = await pswTools.generateAESKey();
      pswTools.storeAesKey(key);
    }
    );
});