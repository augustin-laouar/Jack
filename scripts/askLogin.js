import * as tools from './login_tools.js';
import * as error from './exception/error.js';
import { togglePassword } from './style/toggle_password.js';

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
      const password = document.getElementById('password').value;
      if(await tools.login(password)){
        browser.runtime.sendMessage({subject: 'isLogged', status: true});
        window.close();
      }
      else{
        const infoLabel = document.getElementById('info');
        infoLabel.innerText = 'Login failed.';
      }
    });
    const togglePasswordElement = document.getElementById('toggle-btn');
    const showIcon = document.getElementById('show-psw');
    const hideIcon = document.getElementById('hide-psw');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(password, showIcon, hideIcon);
    });
  }
  catch(error){
    showError(error);
  }

});