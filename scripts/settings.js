import * as tools from './login_tools.js';
import * as error from './exception/error.js';
import * as export_tools from './export.js';
import * as crypto from './tools/crypto.js';
import * as popup from './popup.js';
import { reset } from './reset.js';
import * as password_generator from './password/generator.js';
import { logout } from './login_tools.js';

function showError(e){
    if(!(e instanceof error.Error)){
        return;
    }
    const message = error.errorToString(e);
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-warning';
}

function showInfo(message){
    const infoLabel = document.getElementById('info');
    infoLabel.innerHTML = message;
    infoLabel.className = 'text-info';

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


function changePasswordContent() {
    return `
    <div class="container d-flex justify-content-center align-items-center flex-column">
        <p class="lead text-center">Change password</p>
        <form id="change-password-form" class="d-flex flex-column align-items-center">
            <input required type="password" class="form-control dark-input mb-1" id="current-psw" placeholder="Current password" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="new-psw" placeholder="New password" autocomplete="off">
            <input required type="password" class="form-control dark-input mb-1" id="new-psw-confirm" placeholder="Confirm new password" autocomplete="off">
            <button type="submit" class="confirm-button">Change password</button>
        </form>
        <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
    </div>
  `;
}

async function changePassword() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(changePasswordContent());
    popup.openPopup();
    popup.setPopupSize(300, 300);
    const popupContent = document.getElementById('popup-content');
    const changePswForm = popupContent.querySelector('#change-password-form');
    const currentPsw = popupContent.querySelector('#current-psw');
    const newPsw = popupContent.querySelector('#new-psw');
    const newPswConfirm = popupContent.querySelector('#new-psw-confirm');
    currentPsw.value = '';
    newPsw.value = '';
    newPswConfirm.value = '';
    changePswForm.addEventListener('submit', async function(event) {
        try {
            event.preventDefault();
            if(newPsw.value === '' || newPsw.value === null) {
                return;
            }
            if (await crypto.validPassword(currentPsw.value) === false) {
                showPopupInfo('Wrong current password.', true);
            }
            else if(newPsw.value !== newPswConfirm.value){
                showPopupInfo('Passwords are not the same.', true);
            }
            else {
                await tools.changePassword(newPsw.value);
                popup.closePopup();
                showInfo('Password updated !');
            }
            currentPsw.value = '';
            newPsw.value = '';
            newPswConfirm.value = '';
        }
        catch(e) {
            showPopupError(e);
        }
    });
}


function passwordConfirmPopupContent(optionalContent, buttonText = 'Confirm') {
    return `
      <p class="lead">Confirm your password</p>
      `
      + 
      optionalContent 
      +
      `
      <form id="confirm-psw-form">
          <div class="m-1">
            <input placeholder="Enter your password" type="password" id="confirm-psw-input" autocomplete="off" class="form-control dark-input d-block mx-auto" style="width: 80%;">
            <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 80%;">` + buttonText + `</button>
          </div>
      </form>
      <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
    `;
}

async function askForPasswordConfirm(optionalContent, buttonText) {
    popup.initClosePopupEvent();
    popup.fillPopupContent(passwordConfirmPopupContent(optionalContent, buttonText));
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmPswForm = popupContent.querySelector('#confirm-psw-form');
    const confirmPswInput = popupContent.querySelector('#confirm-psw-input');

    return new Promise((resolve, reject) => {
        confirmPswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmPswInput.value;
            try {
                if (await crypto.validPassword(givenPsw) === false) {
                    showPopupInfo('Invalid password.', true);
                    confirmPswInput.value = '';
                } else {
                    popup.closePopup();
                    resolve(givenPsw);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

function confirmFilePswContent() {
    return `
    <p class="lead">Import data</p>
    <p class="text-warning" style="font-size: 0.9em;">Your current data will be deleted and replaced with the data from the imported file.</p>
    <form id="confirm-file-psw-form">
        <div class="m-1">
          <input placeholder="File's password" type="password" id="confirm-file-psw-input" autocomplete="off" class="form-control dark-input d-block mx-auto" style="width: 80%;">
          <button type="submit" class="confirm-button mt-2 d-block mx-auto" style="width: 80%;">Import</button>
        </div>
    </form>
    <p id="popup-info" class="mt-2" style="font-size: 0.8em;"></p>
  `;
}

async function confirmFilePsw() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(confirmFilePswContent());
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const confirmFilePswForm = popupContent.querySelector('#confirm-file-psw-form');
    const confirmFilePswInput = popupContent.querySelector('#confirm-file-psw-input');

    return new Promise((resolve, reject) => {
        confirmFilePswForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const givenPsw = confirmFilePswInput.value;
            resolve(givenPsw);
            popup.closePopup();
        });
    });
}

function getGeneratorDivContent(name) {
    return `
    <div class="text-info d-flex justify-content-between align-items-center">
    <span id="name" style="overflow-y: scroll; white-space: nowrap; width: 70%; cursor: pointer;">` + name + `</span>
    <button id="delete-button" class="btn transparent-button">
      <img src="../svg-images/delete.svg" alt="Delete" style="width: 20px; height: 20px;">
    </button>       
    </div>
    `;
}
async function fillGeneratorsList() {
    const generators = await password_generator.getGenerators();
    const generatorsListDiv = document.getElementById('generators-list');
    generatorsListDiv.innerHTML = '';
    for(const generator of generators) {
        const divElement = document.createElement('div');
        divElement.innerHTML = getGeneratorDivContent(generator.name);
        const name = divElement.querySelector('#name');
        const deleteButton = divElement.querySelector('#delete-button');
        name.addEventListener('click', function(){
            //todo edit
        });
        deleteButton.addEventListener('click', async function(){
            try{
                await password_generator.deleteGenerator(generator.id);
                fillGeneratorsList();
            }
            catch(e) {
                showError(e);
            }
        });
        generatorsListDiv.appendChild(divElement);
    }
}

function addGeneratorPopupContent() {
    return `
    <p class="lead">New generator</p>
    <form id="add-generator-form" class="d-flex flex-column" style="width: 90%;">
        <div class="form-group">
            <label for="name">Name</label>
            <input required class="form-control dark-input" id="generator-name" autocomplete="off">
        </div>
        <div class="form-group">
            <label for="password-length">Password length</label>
            <input required type="range" id="password-length" name="password-length" min="1" max="50" value="12" step="1" style="width:55%";>
            <span id="password-length-display" style="width:5%";>12</span>
        </div>
        <div class="form-group">
            <label for="excluded-chars">Excluded characters</label>
            <input class="form-control dark-input" id="excluded-chars" autocomplete="off">
        </div>
        <div class="form-group">
            <label for="allowed-chars">Allowed characters</label>
            <div id="allowed-chars">
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="lowercase" name="allowed-chars" value="lowercase" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="lowercase">
                        Lowercase
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="uppercase" name="allowed-chars" value="uppercase" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="uppercase">
                        Uppercase
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="numbers" name="allowed-chars" value="numbers" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="numbers">
                        Numbers
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" style="width: 1em;" type="checkbox" id="special-chars" name="allowed-chars" value="special-chars" checked>
                    <label class="form-check-label" style="width: 100%; text-align: left;" for="special-chars">
                        Special Characters
                    </label>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <button type="submit" class="confirm-button" style="width:30%;">Save</button>
        </div>
    </form>
    <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
  `;
}

async function addGenerator() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(addGeneratorPopupContent());
    popup.setPopupSize(600, 500);
    popup.openPopup();
    const popupContent = document.getElementById('popup-content');
    const addGeneratorForm = popupContent.querySelector('#add-generator-form');
    const generatorName = popupContent.querySelector('#generator-name');
    const passwordLength = popupContent.querySelector('#password-length');
    const passwordLengthDisplay = popupContent.querySelector('#password-length-display');
    const excludedChars = popupContent.querySelector('#excluded-chars');
    const lowercaseCheckbox = popupContent.querySelector('#lowercase');
    const uppercaseCheckbox = popupContent.querySelector('#uppercase');
    const numbersCheckbox = popupContent.querySelector('#numbers');
    const specialCharsCheckbox = popupContent.querySelector('#special-chars');

    addGeneratorForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        try {
            const char_list = password_generator.getCharList(
                lowercaseCheckbox.checked,
                uppercaseCheckbox.checked,
                numbersCheckbox.checked,
                specialCharsCheckbox.checked,
                excludedChars.value
            );
            await password_generator.addGenerator(generatorName.value, passwordLength.value, char_list);
            fillGeneratorsList();
            popup.closePopup();
            showInfo('New password generator created !');
        }
        catch(e) {
            showPopupError(e);
        }
    });
    excludedChars.addEventListener('input', function(event) {
        const inputValue = excludedChars.value;
        const uniqueChars = Array.from(new Set(inputValue.split(''))).join('');
        
        if (inputValue !== uniqueChars) {
            excludedChars.value = uniqueChars;
        }
    });
    passwordLength.addEventListener('input', function() {
        passwordLengthDisplay.innerText = passwordLength.value;
    });
}

//MAIN
document.addEventListener('DOMContentLoaded', function() {
    fillGeneratorsList();
    const changePswButton = document.getElementById('change-psw');
    changePswButton.addEventListener('click', function() {
        changePassword();
    });
    const sessionValiditySelect = document.getElementById('session-validity-select');
    sessionValiditySelect.addEventListener('change', function() {
        const sessionValidityValue = sessionValiditySelect.value;
        tools.storeConnexionDuration(sessionValidityValue);
        showInfo('Session validity updated !');
    });
    const addPasswordGeneratorButton = document.getElementById('add-generator-button');
    addPasswordGeneratorButton.addEventListener('click', function() {
        addGenerator();
    });
    const importAccountButton = document.getElementById('import-account');
    importAccountButton.addEventListener('click', async function(){
        const importAccountFile = document.getElementById('import-account-file');
        const keepCurrPsw = document.getElementById('import-keep-psw');
        if(importAccountFile.files.length === 0) {
            showError(new error.Error('Please select an account file to import.', true));
            return;
        }
        try {
            const file = importAccountFile.files[0];
            const filePassword = await confirmFilePsw();
            await export_tools.import_account(file,filePassword, keepCurrPsw.checked);
            showInfo('Account imported with success !');
        }
        catch(e) {
            showError(e);
        }
    });

    const exportDataButton = document.getElementById('export-account');
    exportDataButton.addEventListener('click', async function(){
        try{
            const warningMessage = '<p style="font-size:0.9em;">This file will be protected by your current master password.</p>'
            const buttonText = 'Export';
            const password = await askForPasswordConfirm(warningMessage, buttonText); 
            const fileName = document.getElementById('export-file-name').value;
            await export_tools.export_account(password, fileName);
        }
        catch(e) {
            showError(new error.Error('Unexpected error while exporting your account.', true));
        }
    });

    const resetDataButton = document.getElementById('reset-data');
    resetDataButton.addEventListener('click', async function() {
        const warningMessage = '<p class="text-warning" style="font-size:0.9em;">Warning: Resetting will permanently delete all your data and cannot be undone.</p>'
        const buttonText = 'Reset';
        const password = await askForPasswordConfirm(warningMessage, buttonText); 
        await reset(password);
    });
    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      logout(true);
    });
});