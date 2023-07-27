import * as pswTools from './tools.js';
import * as urlTools from './urlList.js';


document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    var pwdForm = document.getElementById("pwdForm");
    urlTools.refresh();

    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      var id = document.getElementById("identifiant");
      var pwd = document.getElementById("motDePasse");
      var url = document.getElementById("url");
      console.log(id.value + pwd.value);
      await pswTools.storeLogs(url.value,id.value, pwd.value);
      id.value = '';
      pwd.value = '';
      url.value = '';
      urlTools.refresh();
      
    });

});
