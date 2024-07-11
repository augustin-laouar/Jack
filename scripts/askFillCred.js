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
function togglePasswordField(show) {
    const passwordField = document.getElementById('password');
    const title = document.getElementById('popup-title');
    if (show) {
        passwordField.style.display = 'block';
        passwordField.required = true;
        title.text = 'We found credentials for this website ! Login with your password to use them !';
    } else {
        passwordField.style.display = 'none';
        passwordField.required = false;
        title.text = 'We found credentials for this website ! Do you want to use them ?';
    }
}
document.addEventListener("DOMContentLoaded", async function() {
  try{
    var form = document.getElementById("login-form");
    const isLogged = await tools.isLogged();
    if(!isLogged) {
        togglePasswordField(true);
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            var password = document.getElementById('password').value;
            if(await tools.login(password)){
              browser.runtime.sendMessage({subject: 'useCreds'});
              window.close();
            }
            else{
              const infoLabel = document.getElementById('info');
              infoLabel.innerText = 'Login failed.';
            }
        });
    }
    else {
        togglePasswordField(false);
        form.addEventListener("submit", async function(event) {
            browser.runtime.sendMessage({subject: 'useCreds'});
            window.close();
        });
    }

  }
  catch(error){
    showError(error);
  }

});