import * as popup from '../popup.js';
import * as pswTools from './tools.js';
import * as error from '../exception/error.js';
import { fillPasswordList } from './mainPage.js';
function addPopupContent()  {
    return `
      <div class="container d-flex justify-content-center align-items-center flex-column">
        <p class="display-6 text-center">New credentials</p>
        <form id="add-psw-form" class="d-flex flex-column align-items-center">
            <input  class="form-control dark-input mb-1" id="url" placeholder="Associate URL" autocomplete="off">
            <input required class="form-control dark-input mb-1" id="username" placeholder="Username" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="password" placeholder="Password" autocomplete="off">
            <button type="submit" class="confirm-button">Save</button>
        </form>
        <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
    </div>
    `;
}

function showPopupInfo(message, warning = false) {
    const infoLabel = document.getElementById('info-popup');
    infoLabel.innerHTML = message;
    if(warning) {
        infoLabel.classList.remove('text-info');
        infoLabel.classList.add('text-warning');
    }
    else {
        infoLabel.classList.remove('text-warning');
        infoLabel.classList.add('text-info');
    }
}

function showPopupError(e){
    if(!(e instanceof error.Error)){
      return;
    }
    const message = error.errorToString(e);
    showPopupInfo(message, true);
}

document.addEventListener("DOMContentLoaded", async function() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(addPopupContent());
    const addPswButton = document.getElementById('add-psw-button');
    addPswButton.addEventListener('click', async function() {
        popup.openPopup();
    });
    const popupContent = document.getElementById('popup-content');
    const addPasswordForm = popupContent.querySelector('#add-psw-form');
    addPasswordForm.addEventListener("submit", async function(event) {
        event.preventDefault(); //on supprime le comportement par defaut de submit 
        const username = popupContent.querySelector('#url');
        const pwd = popupContent.querySelector('#username');
        const url = popupContent.querySelector('#password');
        try{
            await pswTools.addLog(url.value,username.value, pwd.value);
            username.value = '';
            pwd.value = '';
            url.value = '';
            fillPasswordList();
        }
        catch(error){
            showError(error);
        }
    
    });
});