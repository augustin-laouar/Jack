import * as pswTools from './tools.js';
import * as tools from '../tools.js';
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

function researchPassword(){
  try{
    const logsList = pswTools.getLogsList();
    if(logsList === null){
      return;
    }
    if(logsList.length === 0){
      return;
    }
    const input = document.getElementById('search').value;
    const logsListFiltred = logsList.filter(element => element.includes(input));
    fillPasswordList(logsListFiltred, true);
  }
  catch(error){
    showError(error);
  }

}

function getTrContent(url){ 
  var codeHTML = `
    <td>
      <div style=" max-width: 150px;overflow-x: auto;">
        <p class="text-info" style="white-space: nowrap;">${url}</p>
      </div>
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

async function fillPasswordList(logsListParam = null, searching = false){
  try{
    var logsList;
    if(logsListParam === null){
      logsList = pswTools.getLogsList();
    }
    else{
      logsList = logsListParam;
    }
    const tab = document.querySelector('#tab-body');    
    const head = document.querySelector('#tab-head');

    tab.innerHTML = ''; 
    if(logsList.length === 0){
      head.innerHTML = '';
      if(searching){
        tab.innerHTML = '<p class ="lead">No matching URL.</p>'
      }
      else{
        tab.innerHTML = '<p class ="lead">No password saved for the moment.</p>'
      }
    }
    else{
      head.innerHTML = '<tr><th scope="col">URL</th><th scope="col">Username</th><th scope="col">Password</th></tr>';
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
      const id = document.getElementById("id");
      const pwd = document.getElementById("password");
      const url = document.getElementById("url");
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
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(){
      tools.logout(true);
    });
    const settingsButton = document.getElementById('settings');
    settingsButton.addEventListener("click", async function(event){
      const url = browser.runtime.getURL('../../html/settings.html');
      browser.tabs.create({ url });
    });
    const searchInput = document.getElementById('search');
    let timeout;
    searchInput.addEventListener("input", function() {
      clearTimeout(timeout);
      timeout = setTimeout(researchPassword,1000);
    });


});
