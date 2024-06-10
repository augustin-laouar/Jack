import * as pswTools from './tools.js';
import * as error from '../exception/error.js';
import * as storage from '../tools/storage.js'
import * as login_tools from '../login_tools.js';

function showErrorMessage(message) {
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}
function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}

async function researchPassword(){
  try{
    const logs = await pswTools.getDecryptedLogs();
    if(logs.length === 0){
      return;
    }
    const input = document.getElementById('search').value;
    const searchMethod = document.getElementById('search-method').value;
    let logsFiltred;

    if (searchMethod === 'url') {
        logsFiltred = logs.filter(element => element.content.url.includes(input));
    } 
    else if (searchMethod === 'username') {
      logsFiltred = logs.filter(element => element.content.username.includes(input));
    } 
    else if (searchMethod === 'all') {
      logsFiltred = logs.filter(element => 
        element.content.url.includes(input) || element.content.username.includes(input)
      );
    }
    
    fillPasswordList(logsFiltred, true);
  }
  catch(error){
    showError(error);
  }

}

function getTrContent(title, url, username, description){ 
  var codeHTML = `
    <td>
      <div style="max-width: 150px; overflow-y: auto;">
        <p class="text-info" style="white-space: nowrap;">${title}</p>
      </div>
    </td>
    <td>
      <div style="max-width: 250px; overflow-y: auto;">
        <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-url">${url}</p>
      </div>
    </td>
    <td>
      <div style="max-width: 150px; overflow-y: auto;">
          <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-username">${username}</p>
      </div>
    </td>
    <td>
      <button id="cp-psw-button" class="btn transparent-button">
        <img src="../svg-images/copy.svg" alt="Copy" style="width: 20px; height: 20px;">
      </button>
    </td>
    <td>
      <div style="max-width: 300px; overflow-y: auto;">
          <p class="text-info" style="white-space: nowrap;" id="cp-description">${description}</p>
      </div>
    </td>
    <td>
      <button id="edit-button" class="btn transparent-button">
        <img src="../svg-images/edit.svg" alt="Edit" style="width: 20px; height: 20px;">
      </button>
    </td>
    <td>
      <button id="delete-button" class="btn transparent-button">
        <img src="../svg-images/delete.svg" alt="Delete" style="width: 20px; height: 20px;">
      </button>
    </td>
    `;
  return codeHTML;
}


function editPopUp(id, url, username, psw) {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  const width = 500;
  const height = 350;

  const left = (screenWidth / 2) - (width / 2);
  const top = (screenHeight / 2) - (height / 2);
  storage.store({ popupData: { id, url, username, psw } })
    .then(() => {
      window.open('../../html/editPsw.html', 'Edit', `width=${width},height=${height},resizable=yes,left=${left},top=${top}`);
    });
}


export async function fillPasswordList(logsParam = null, searching = false){
  try{
    var credentials;
    if(logsParam === null){
      credentials = await pswTools.getDecryptedLogs();
    }
    else{
      credentials = logsParam;
    }
    const tab = document.querySelector('#tab-body');    
    const head = document.querySelector('#tab-head');

    tab.innerHTML = ''; 
    if(credentials.length === 0){
      head.innerHTML = '';
      if(searching){
        tab.innerHTML = '<p class ="lead">No matching result.</p>'
      }
      else{
        tab.innerHTML = '<p class ="lead">No credentials saved for the moment.</p>'
      }
    }
    else{
      head.innerHTML = '<tr><th scope="col">Title</th><th scope="col">URL</th><th scope="col">Username</th><th scope="col">Password</th><th scope="col">Description</th></tr>';
      for(const credential of credentials) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(credential.content.title, credential.content.url, credential.content.username, credential.content.description);
        const copyUrl = trElement.querySelector('#cp-url')
        const copyUsername = trElement.querySelector('#cp-username');
        const copyPasswordButton = trElement.querySelector('#cp-psw-button');
        const editButton = trElement.querySelector('#edit-button');
        const deleteButton = trElement.querySelector('#delete-button');

        copyUrl.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.url);
          }
          catch(error){
            showError(error);
          }
        });
        copyUsername.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.username);
          }
          catch(error){
            showError(error);
          }
        });
        copyPasswordButton.addEventListener('click', async function(){
          try{
            copyToClipboard(credential.content.password);
          }
          catch(error){
            showError(error);
          }
        });
        editButton.addEventListener('click', async function(){
          try{
            editPopUp(credential.id, credential.content.url, credential.content.username, credential.content.password); 
          }
          catch(error){
            showError(error);
          }
        });
        deleteButton.addEventListener('click', async function(){
          try{
            await pswTools.deleteLog(credential.id);
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
  } catch (e) {
    throw new error.Error('Error copying to clipboard.', true);
  }
}

document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    fillPasswordList();
    const searchInput = document.getElementById('search');
    let timeout;
    searchInput.addEventListener("input", function() {
      clearTimeout(timeout);
      timeout = setTimeout(researchPassword,100);
    });
    const searchMethod = document.getElementById('search-method');
    searchMethod.addEventListener('change', function() {
      researchPassword();
    });
    //Listen for messages from popup
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      if (message.action === "updatePswList") {
        fillPasswordList();
      }
      if (message.action === "errorUpdatePsw") {
        if(message.error){
          showErrorMessage(message.error.message, message.error.type);
        }
      }
    });
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      login_tools.logout(true);
    });
    const settingsButton = document.getElementById('settings');
    settingsButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/settings.html');
      browser.tabs.create({ url });
    });
    const helpButton = document.getElementById('help');
    helpButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/help.html');
      browser.tabs.create({ url });
    });
});
