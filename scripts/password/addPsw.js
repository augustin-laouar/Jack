import * as popup from '../popup.js';
import * as pswTools from './tools.js';
import * as error from '../exception/error.js';
import { fillPasswordList } from './mainPage.js';
function addPopupContent()  {
    return `
      <div class="container d-flex justify-content-center align-items-center flex-column">
        <p class="lead text-center">New credentials</p>
        <form id="add-psw-form" class="d-flex flex-column align-items-center" style="width: 80%;">
            <input required class="form-control dark-input mb-1" id="title" placeholder="Title" autocomplete="off">
            <input  class="form-control dark-input mb-1" id="url" placeholder="Associate URL" autocomplete="off">
            <input  class="form-control dark-input mb-1" id="username" placeholder="Username" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="password" placeholder="Password" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="password-confirm" placeholder="Confirm password" autocomplete="off">
            <textarea class="form-control dark-input mb-1" id="description" rows="3" placeholder="Description"></textarea>
            <button type="submit" class="confirm-button">Save</button>
        </form>
        <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
    </div>
    `;
}

function showPopupInfo(message, warning = false) {
    const infoLabel = document.getElementById('popup-info');
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
    const addPswButton = document.getElementById('add-psw-button');
    addPswButton.addEventListener('click', async function() {
        popup.fillPopupContent(addPopupContent());
        popup.openPopup();
        const popupContent = document.getElementById('popup-content');
        const addPasswordForm = popupContent.querySelector('#add-psw-form');
        addPasswordForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const title = popupContent.querySelector('#title');
            const url = popupContent.querySelector('#url');
            const username = popupContent.querySelector('#username');
            const psw = popupContent.querySelector('#password');
            const pswConfirm = popupContent.querySelector('#password-confirm');
            const description = popupContent.querySelector('#description');
            try{
                if(psw.value !== pswConfirm.value) {
                    showPopupInfo('Passwords are not the same.', true);
                    return;
                }
                await pswTools.addLog(title.value, url.value, username.value, psw.value, description.value);
                title.value = '';
                username.value = '';
                psw.value = '';
                url.value = '';
                description.value = '';
                popup.closePopup();
                fillPasswordList();
            }
            catch(error){
                showPopupError(error);
            }
        
        });
    });
});