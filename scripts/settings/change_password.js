import * as popup from '../popup.js';
import * as crypto from '../tools/crypto.js';
import * as login_tools from '../login_tools.js';
import {showInfo, showError, showPopupError, showPopupInfo} from './info.js';
import { updatePasswordStrength } from '../password/pswStrength.js';
import { togglePassword } from '../style/toggle_password.js';

function changePasswordContent() {
    return `
    <div class="container d-flex justify-content-center align-items-center flex-column">
        <p class="lead text-center">Change password</p>
        <form id="change-password-form" class="d-flex flex-column align-items-center" style="width:85%;">
            <div class="form-group password-wrapper mb-1" style="width:100%;">
                <input type="password" id="current-psw" class="form-control dark-input" placeholder="Current password" autocomplete="off" required>
                <span id="toggle-btn-1" class="toggle-password">
                    <img id="show-psw-1" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw-1" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <div class="form-group password-wrapper mb-1" style="width:100%;">
                <input type="password" id="new-psw" class="form-control dark-input" placeholder="New password" autocomplete="off" required>
                <span id="toggle-btn-2" class="toggle-password">
                    <img id="show-psw-2" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw-2" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <div class="form-group password-wrapper mb-2" style="width:100%;">
                <input type="password" id="new-psw-confirm" class="form-control dark-input" placeholder="Confirm new password" autocomplete="off" required>
                <span id="toggle-btn-3" class="toggle-password">
                    <img id="show-psw-3" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw-3" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
            <button type="submit" class="confirm-button mb-2">Change password</button>
            <div id="password-strength-wrapper" class="password-strength-wrapper w-100" style="visibility: hidden;">
                <div class="password-strength" id="password-strength">
                    <div id="password-strength-bar" class="password-strength-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div id="password-strength-text" class="password-strength-text"'></div>
            </div>
        </form>
        <p id="popup-info" class="mt-2 text-center" style="font-size: 0.8em;"></p>
    </div>
  `;
}

async function changePassword() {
    popup.initClosePopupEvent();
    popup.fillPopupContent(changePasswordContent());
    popup.openPopup();
    popup.setPopupSize(400, 300);
    const popupContent = document.getElementById('popup-content');
    const changePswForm = popupContent.querySelector('#change-password-form');
    const currentPsw = popupContent.querySelector('#current-psw');
    const newPsw = popupContent.querySelector('#new-psw');
    const newPswConfirm = popupContent.querySelector('#new-psw-confirm');
    currentPsw.value = '';
    newPsw.value = '';
    newPswConfirm.value = '';
    updatePasswordStrength(newPsw.value);
    newPsw.addEventListener('input', async function() {
        updatePasswordStrength(newPsw.value);
    });
    changePswForm.addEventListener('submit', async function(event) {
        try {
            event.preventDefault();
            if(newPsw.value === '' || newPsw.value === null) {
                return;
            }
            if (await crypto.validPassword(currentPsw.value) === false) {
                showPopupInfo('Wrong current password.', true);
                currentPsw.value = '';
            }
            else if(newPsw.value !== newPswConfirm.value){
                showPopupInfo('Passwords are not the same.', true);
                newPsw.value = '';
                newPswConfirm.value = ''
            }
            else {
                await login_tools.changePassword(newPsw.value);
                popup.closePopup();
                currentPsw.value = '';
                newPsw.value = '';
                newPswConfirm.value = ''
                showInfo('Password updated !');
            };
        }
        catch(e) {
            showPopupError(e);
        }
    });

    const togglePasswordElement = popupContent.querySelector('#toggle-btn-1');
    const showIcon = popupContent.querySelector('#show-psw-1');
    const hideIcon = popupContent.querySelector('#hide-psw-1');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(currentPsw, showIcon, hideIcon);
    });
    const togglePasswordElement2 = popupContent.querySelector('#toggle-btn-2');
    const showIcon2 = popupContent.querySelector('#show-psw-2');
    const hideIcon2 = popupContent.querySelector('#hide-psw-2');
    togglePasswordElement2.addEventListener('click', function() { 
        togglePassword(newPsw, showIcon2, hideIcon2);
    });
    const togglePasswordElement3 = popupContent.querySelector('#toggle-btn-3');
    const showIcon3 = popupContent.querySelector('#show-psw-3');
    const hideIcon3 = popupContent.querySelector('#hide-psw-3');
    togglePasswordElement3.addEventListener('click', function() { 
        togglePassword(newPswConfirm, showIcon3, hideIcon3);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const changePswButton = document.getElementById('change-psw');
    changePswButton.addEventListener('click', function() {
        changePassword();
    });
});