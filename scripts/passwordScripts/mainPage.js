import * as pswTools from './tools.js';
import * as errorManager from '../exception/passwordError.js';

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


function getTrContent(url){ 
  var newUrl = url;
  if(url.length > 30){
    var newUrl = url.substring(0,30) + '...';
  }
  var codeHTML = `
    <td>
      <p class="text-info">${newUrl}</p>
    </td>
    <td>
      <button id="cp-username-button" class="btn btn-outline-info">Copy</button>
    </td>
    <td>
      <button id="cp-psw-button" class="btn btn-outline-info">Copy</button>
    </td>
    <td>
      <button id="delete-button" class="btn btn-danger">Delete</button>
    </td>
    `;
  return codeHTML;
}

async function fillPasswordList(){
  try{
    const logsList = pswTools.getLogsList();
    const tab = document.querySelector('#tab-body');
    tab.innerHTML = ''; 
    for(const logs of logsList) {
      const logsData = await pswTools.getLogs(logs);   
      const trElement = document.createElement('tr');
      trElement.innerHTML = getTrContent(logsData.url);
      const cpUsernameButton = trElement.querySelector('#cp-username-button');
      const cpPasswordButton = trElement.querySelector('#cp-psw-button');
      const deleteButton = trElement.querySelector('#delete-button');
      cpUsernameButton.addEventListener('click', async function(){
        try{
          copyToClipboard(logsData.id);
        }
        catch(error){
          showError(error);
        }
      });
      cpPasswordButton.addEventListener('click', async function(){
        try{
          copyToClipboard(logsData.password);
        }
        catch(error){
          showError(error);
        }
      });
      deleteButton.addEventListener('click', async function(){
        try{
          pswTools.deleteLogs(logsData.url);
          fillPasswordList();
        }
        catch(error){
          showError(error);
        }
      });
      tab.appendChild(trElement);
    }
  }
  catch(error){
    showError(error);
  }

}


// Fonction pour copier le texte dans le presse-papiers
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    throw errorManager.Error(1,1,'Error while copying to clipboard.');
  }
}

document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    fillPasswordList();
    const pwdForm = document.getElementById("pwd-form");
    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      var id = document.getElementById("id");
      var pwd = document.getElementById("password");
      var url = document.getElementById("url");
      try{
        await pswTools.createLogs(url.value,id.value, pwd.value);
      }
      catch(error){
        showError(error);
      }
      id.value = '';
      pwd.value = '';
      url.value = '';
      fillPasswordList();
    });

});
