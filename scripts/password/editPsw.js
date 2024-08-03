import { fillPasswordList } from './mainPage.js';
import * as popup from '../popup.js';
import {fillGenerators} from './addPsw.js';
import { updatePasswordStrength } from '../style/pswStrength.js';
import { togglePassword } from '../style/toggle_password.js';
import * as request from '../manager/manager_request.js';

function editPopupContent(title)  {
  if(title.length > 20) {
    title = title.substring(0, 20) + '...';
  }
  return `
  <div class="container d-flex justify-content-center align-items-center flex-column">
    <p class="lead text-center">Edit ` + title + `</p>
    <form id="edit-credential-form" class="d-flex flex-column" style="width: 90%;">
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
            <div class="form-group password-wrapper" style="width:60%;">
                <input type="password" id="password" style="width:100%;" class="form-control dark-input" autocomplete="off" required>
                <span id="toggle-btn-1" class="toggle-password">
                    <img id="show-psw-1" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw-1" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
        </div>
        <div class="form-group form-group-custom">
            <label for="password-confirm">Confirm password</label>
            <div class="form-group password-wrapper" style="width:60%;">
                <input type="password" id="password-confirm" style="width:100%;" class="form-control dark-input" autocomplete="off" required>
                <span id="toggle-btn-2" class="toggle-password">
                    <img id="show-psw-2" src="/svg-images/show.svg" alt="Show">
                    <img id="hide-psw-2" src="/svg-images/hide.svg" alt="Hide" style="display:none;">
                </span>
            </div>
        </div>
        <div class="form-group form-group-custom">
        <label for="password-strength">Password Strength</label>
        <div id="password-strength-wrapper" class="password-strength-wrapper" style="visibility: hidden;">
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
              <button id="generate-password" type="button" class="btn transparent-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Generate password">
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


export async function editCredential(id, title, url, username, password, description) {
  popup.initClosePopupEvent();
  popup.fillPopupContent(editPopupContent(title));
  popup.openPopup();
  popup.setPopupSize(700,600);
  const popupContent = document.getElementById('popup-content');
  const titleInput = popupContent.querySelector('#title');
  const urlInput = popupContent.querySelector('#url');
  const usernameInput = popupContent.querySelector('#username');
  const pswInput = popupContent.querySelector('#password');
  const pswConfirmInput = popupContent.querySelector('#password-confirm');
  const descriptionInput = popupContent.querySelector('#description');
  const generatePassword = popupContent.querySelector('#generate-password');
  const selectGenerator = popupContent.querySelector('#select-generator');
  const editCredentialForm = popupContent.querySelector('#edit-credential-form');
  
  await fillGenerators(selectGenerator);

  titleInput.value = title;
  urlInput.value = url;
  usernameInput.value = username;
  pswInput.value = password;
  pswConfirmInput.value = password;
  descriptionInput.value = description;
  updatePasswordStrength(pswInput.value);

  editCredentialForm.addEventListener("submit", async function(event) {
      event.preventDefault(); 
      try{
        if(pswInput.value !== pswConfirmInput.value) {
          showPopupInfo('Passwords are not the same.', true);
          return;
        }
        const params = {
            id: id,
            title: titleInput.value,
            url: urlInput.value,
            username: usernameInput.value,
            password: pswInput.value,
            description: descriptionInput.value
        };
        await request.makeRequest('credentials', 'update', params);
        
          popup.closePopup();
          fillPasswordList();
      }
      catch(error){
          showPopupError(error);
      }
  });

  generatePassword.addEventListener('click', async function() {
    const password = await request.makeRequest('generators', 'generate', { generator_id: selectGenerator.value});
    pswInput.value = password;
    pswConfirmInput.value = password;
    updatePasswordStrength(password);

  });
  pswInput.addEventListener('input', async function() {
    updatePasswordStrength(pswInput.value);
  });

    const togglePasswordElement = popupContent.querySelector('#toggle-btn-1');
    const showIcon = popupContent.querySelector('#show-psw-1');
    const hideIcon = popupContent.querySelector('#hide-psw-1');
    togglePasswordElement.addEventListener('click', function() { 
        togglePassword(pswInput, showIcon, hideIcon);
    });
    const togglePasswordElement2 = popupContent.querySelector('#toggle-btn-2');
    const showIcon2 = popupContent.querySelector('#show-psw-2');
    const hideIcon2 = popupContent.querySelector('#hide-psw-2');
    togglePasswordElement2.addEventListener('click', function() { 
        togglePassword(pswConfirmInput, showIcon2, hideIcon2);
    });

}