import * as error from './exception/error.js';
import { togglePassword } from './style/toggle_password.js';
import * as request from './manager/manager_request.js';

function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}

document.addEventListener("DOMContentLoaded", async function() {
  try{
    const isFirstLogin = await request.makeRequest('session', 'isFirstLogin', null);
    if(isFirstLogin) {
      window.location.href = "/html/firstConnection.html";
    }
    const isLogged = await request.makeRequest('session', 'check', null);
    if(isLogged) {
      window.location.href = "/html/emails.html";
    }
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      var password = document.getElementById("password").value;
      const result = await request.makeRequest('login', null, { password: password });
      if(result) {
        request.makeRequest('managerIgnore', 'loginSucess', null);
        window.location.href = "/html/emails.html";
      }
      else{
        const infoLabel = document.getElementById('info');
        infoLabel.innerText = 'Wrong password.';
      }
    });

    var togglePasswordElement = document.querySelector('.toggle-password');
    var passwordInput = document.getElementById('password');
    var eyeIcon = document.getElementById('show-password');
    var eyeOffIcon = document.getElementById('hide-password');
    togglePasswordElement.addEventListener('click', function() { 
      togglePassword(passwordInput, eyeIcon, eyeOffIcon);
    });
  }
  catch(error){
    showError(error);
  }

});