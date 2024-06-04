import * as popup from '../popup.js';
import { fillAddressList, showInfo } from './mainPage.js';
import * as storage from './storage_tools.js';
import * as error from '../exception/error.js';

function addPopupContent()  {
    return `
      <p class="display-6">New email address</p>
      <p class="lead" style="font-size:0.9em;">Leave email name empty to generate a random address !</p>
      <form id="add-email-form">
          <div class="m-1">
            <input id="email-name" autocomplete="off" placeholder="Email name (optional)" class="form-control dark-input d-block mx-auto" style="width: 80%; placeholder::placeholder { font-size: 0.7em; }">
            <button type="submit" class="btn btn-info mt-2 d-block mx-auto" style="width: 80%;">Generate</button>
          </div>
      </form>
      <p id="info-popup" class="text-warning mt-2" style="font-size: 0.8em;"></p>
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


document.addEventListener("DOMContentLoaded", function() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(addPopupContent());
    const addEmailButton = document.getElementById('add-email-button');
    addEmailButton.addEventListener('click', function() {
        popup.openPopup();
    });
    const popupContent = document.getElementById('popup-content');
    const addEmailForm = popupContent.querySelector('#add-email-form');
    addEmailForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const addressInput = popupContent.querySelector('#email-name');
        try{
            if (addressInput.value.trim() === "") { //Generate a random address
                await storage.createRandomEmail();
            } else {
                await storage.createEmail(addressInput.value);
            }
            addressInput.value = '';      
            popup.closePopup();
            showInfo('Email created !');
            fillAddressList();
        }
        catch(error){
            showPopupError(error);
        }
    });
});