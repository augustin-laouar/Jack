import * as tools from './tools.js';

function showError(error){
  if(!(error instanceof errorManager.Error)){
    return;
  }
  const errorStr = errorManager.errorToString(error);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = errorStr;
  if(error.type === 1){
    infoLabel.classList.remove('text-warning');
    infoLabel.classList.add('text-danger'); //system error
  }
  if(error.type === 2){
    infoLabel.classList.remove('text-danger');
    infoLabel.classList.add('text-warning'); //user error
  }
}

document.addEventListener("DOMContentLoaded", function() {
  try{
    var form = document.getElementById("login-form");
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      var password = document.getElementById("password").value;
      if(await tools.login(password)){
        window.location.href = "../html/emails.html";
      }
      else{
        document.getElementById('info').innerText = 'Login failed.';
        infoLabel.classList.remove('text-danger');
        infoLabel.classList.add('text-warning'); 
      }
    });
  }
  catch(error){
    showError(error);
  }

});