import * as tools from './login_tools.js';
import * as error from './exception/error.js';

function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}

document.addEventListener("DOMContentLoaded", function() {
  try{
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      var password = document.getElementById('password').value;
      if(await tools.login(password)){
        browser.runtime.sendMessage({subject: 'isLogged', status: true});
        window.close();
      }
      else{
        const infoLabel = document.getElementById('info');
        infoLabel.innerText = 'Login failed.';
      }
    });
  }
  catch(error){
    showError(error);
  }

});