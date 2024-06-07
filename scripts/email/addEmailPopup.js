import * as popup from '../popup.js';
import { fillAddressList, showInfo } from './mainPage.js';
import * as storage from './storage_tools.js';
import * as error from '../exception/error.js';
import { getDomains } from './api_tools.js';

function addPopupContent()  {
    return `
      <p class="display-6">New email address</p>
      <p class="lead" style="font-size:0.9em;">Leave email name empty to generate a random address !</p>
      <form id="add-email-form">
        <div class="d-flex align-items-center m-1">
            <div class="me-1" style="width:60%;">
                <input id="email-name" autocomplete="off" placeholder="Email name (optional)" class="form-control dark-input" style="font-size: 0.8em;">
            </div>
            <div style="width:60%;">
                <select class="form-select dark-select mb-1" id="select-domain" style="font-size: 0.8em;"></select>
            </div>
        </div>
        <button type="submit" class="btn btn-primary mt-2 d-block mx-auto" style="width: 50%;">Generate</button>
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

async function fillSelectDomain() {
    const selectDomain = document.getElementById('select-domain');
    selectDomain.innerHTML = '';
    const domains = await getDomains();
    let options = [];
    domains.forEach(domain => {
        const text = '@' + domain;
        options.push({value: domain, text: text});
    });    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectDomain.appendChild(optionElement);
    });
}
document.addEventListener("DOMContentLoaded", async function() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(addPopupContent());
    await fillSelectDomain();
    const addEmailButton = document.getElementById('add-email-button');
    addEmailButton.addEventListener('click', async function() {
        popup.openPopup();
    });
    const popupContent = document.getElementById('popup-content');
    const addEmailForm = popupContent.querySelector('#add-email-form');
    addEmailForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const addressInput = popupContent.querySelector('#email-name');
        const selectDomain = popupContent.querySelector('#select-domain');
        try{
            if (addressInput.value.trim() === "") { //Generate a random address
                await storage.createRandomEmail(selectDomain.value);
            } else {
                const address = addressInput.value + '@' + selectDomain.value;
                await storage.createEmail(address);
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