import * as popup from '../popup.js';
import * as pswTools from './tools.js';
import * as error from '../exception/error.js';
import { fillPasswordList } from './mainPage.js';
import { getRandomPassword, getGenerators } from './generator.js';
import { updatePasswordStrength } from './pswStrength .js';

function addPopupContent()  {
    return `
        <div class="container d-flex justify-content-center align-items-center flex-column">
            <p class="lead text-center">New credentials</p>
            <form id="add-psw-form" class="d-flex flex-column" style="width: 90%;">
                <div class="form-group form-group-custom">
                    <label for="title">Title</label>
                    <input required class="form-control dark-input" id="title" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="url">Associate URL</label>
                    <input class="form-control dark-input" id="url" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="username">Username</label>
                    <input class="form-control dark-input" id="username" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="description">Description</label>
                    <textarea class="form-control dark-input" id="description" rows="2"></textarea>
                </div>
                <div class="form-group form-group-custom">
                    <label for="password">Password</label>
                    <input required type="password" class="form-control dark-input" id="password" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="password-confirm">Confirm password</label>
                    <input required type="password" class="form-control dark-input" id="password-confirm" autocomplete="off">
                </div>
                <div class="form-group form-group-custom">
                    <label for="password-strength">Password Strength</label>
                    <div class="password-strength-wrapper">
                        <div class="password-strength" id="password-strength">
                            <div id="password-strength-bar" class="password-strength-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div id="password-strength-text" class="password-strength-text"></div>
                    </div>
                </div>
                <div class="form-group form-group-custom">
                    <label for="generator-div">Password generator</label>
                    <div class="d-flex" id="generator-div"> 
                        <select id="select-generator" class="form-select dark-select me-1" style="font-size: 0.8em;"></select>
                        <button id="generate-password" type="button" class="btn transparent-button">
                            <img src="../svg-images/launch.svg" alt="Generate" style="width: 20px; height: 20px;">
                        </button>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="confirm-button" style="width:30%;">Save</button>
                </div>
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

export async function fillGenerators(selectElement) {
   const generators = await getGenerators();
   for(const generator of generators) {
        const opt = document.createElement('option');
        opt.value = generator.id;
        opt.innerHTML = generator.name;
        selectElement.appendChild(opt);
   }
}
document.addEventListener("DOMContentLoaded", async function() {
    popup.initClosePopupEvent();
    const addPswButton = document.getElementById('add-psw-button');
    addPswButton.addEventListener('click', async function() {
        popup.fillPopupContent(addPopupContent());
        popup.openPopup();

        const popupContent = document.getElementById('popup-content');
        const addPasswordForm = popupContent.querySelector('#add-psw-form');
        const title = popupContent.querySelector('#title');
        const url = popupContent.querySelector('#url');
        const username = popupContent.querySelector('#username');
        const psw = popupContent.querySelector('#password');
        const pswConfirm = popupContent.querySelector('#password-confirm');
        const description = popupContent.querySelector('#description');
        const generatePassword = popupContent.querySelector('#generate-password');
        const selectGenerator = popupContent.querySelector('#select-generator');
        updatePasswordStrength(psw.value);
        await fillGenerators(selectGenerator);
        addPasswordForm.addEventListener("submit", async function(event) {
            event.preventDefault();
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

        generatePassword.addEventListener('click', async function() {
            const password = await getRandomPassword(selectGenerator.value);
            psw.value = password;
            pswConfirm.value = password;
            updatePasswordStrength(password);
        });
        psw.addEventListener('input', async function() {
            updatePasswordStrength(psw.value);
        });
    });
});