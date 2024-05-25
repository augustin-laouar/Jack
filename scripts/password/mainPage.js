import * as pswTools from './tools.js';
import * as error from '../exception/error.js';
import * as storage from '../tools/storage.js'

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

function getTrContent(url, id){ 
  var codeHTML = `
    <td style="width: 350px;">
      <div style=" max-width: 300px;overflow-x: auto;">
        <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-url">${url}</p>
      </div>
    </td>
    <td style="width: 250px;">
      <div style="display: flex; align-items: center;">
        <div style="width: 200px; overflow-x: auto;">
          <p class="text-info" style="white-space: nowrap; cursor: pointer;" id="cp-username">${id}</p>
        </div>
      </div>
    </td>
    <td>
      <button id="cp-psw-button" class="btn btn-outline-info">Copy</button>
    </td>
    <td>
    <button id="edit-button" class="btn btn-secondary">Edit</button>
    </td>
    <td>
      <button id="delete-button" class="btn btn-danger">Delete</button>
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
      // Open the new window centered on the screen
      window.open('../../html/editPsw.html', 'Edit', `width=${width},height=${height},resizable=yes,left=${left},top=${top}`);
    });
}


async function fillPasswordList(logsParam = null, searching = false){
  try{
    var logs;
    if(logsParam === null){
      logs = await pswTools.getDecryptedLogs();
    }
    else{
      logs = logsParam;
    }
    const tab = document.querySelector('#tab-body');    
    const head = document.querySelector('#tab-head');

    tab.innerHTML = ''; 
    if(logs.length === 0){
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
      for(const log of logs) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(log.content.url, log.content.username);
        const copyUrl = trElement.querySelector('#cp-url')
        const copyUsername = trElement.querySelector('#cp-username');
        const copyPasswordButton = trElement.querySelector('#cp-psw-button');
        const editButton = trElement.querySelector('#edit-button');
        const deleteButton = trElement.querySelector('#delete-button');

        copyUrl.addEventListener('click', async function(){
          try{
            copyToClipboard(log.content.url);
          }
          catch(error){
            showError(error);
          }
        });
        copyUsername.addEventListener('click', async function(){
          try{
            copyToClipboard(log.content.username);
          }
          catch(error){
            showError(error);
          }
        });
        copyPasswordButton.addEventListener('click', async function(){
          try{
            copyToClipboard(log.content.password);
          }
          catch(error){
            showError(error);
          }
        });
        editButton.addEventListener('click', async function(){
          try{
            editPopUp(log.id, log.content.url, log.content.username, log.content.password); 
          }
          catch(error){
            showError(error);
          }
        });
        deleteButton.addEventListener('click', async function(){
          try{
            await pswTools.deleteLog(log.id);
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
    const pwdForm = document.getElementById("pwd-form");
    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      const username = document.getElementById("username");
      const pwd = document.getElementById("password");
      const url = document.getElementById("url");
      //try{
      await pswTools.addLog(url.value,username.value, pwd.value);
      /*}
      catch(error){
        showError(error);
      }*/
      username.value = '';
      pwd.value = '';
      url.value = '';
      fillPasswordList();
    });

    const searchInput = document.getElementById('search');
    let timeout;
    searchInput.addEventListener("input", function() {
      clearTimeout(timeout);
      timeout = setTimeout(researchPassword,100);
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

});
