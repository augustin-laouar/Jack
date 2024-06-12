import * as pswTools from './tools.js';
import { fillPasswordList } from './mainPage.js';
import * as popup from '../popup.js';

function editPopupContent(title)  {
  if(title.length > 20) {
    title = title.substring(0, 20) + '...';
  }
  return `
  <div class="container d-flex justify-content-center align-items-center flex-column">
    <p class="lead text-center">Edit ` + title + `</p>
    <form id="edit-credential-form" class="d-flex flex-column" style="width: 80%;">
      <div class="form-group w-100 mb-1">
        <label for="title" class="mb-1 text-left">Title</label>
        <input required class="form-control dark-input" id="title" autocomplete="off">
      </div>
      <div class="form-group w-100 mb-1">
        <label for="url" class="mb-1 text-left">Associate URL</label>
        <input class="form-control dark-input" id="url" autocomplete="off">
      </div>
      <div class="form-group w-100 mb-1">
        <label for="username" class="mb-1 text-left">Username</label>
        <input class="form-control dark-input" id="username" autocomplete="off">
      </div>
      <div class="form-group w-100 mb-1">
        <label for="password" class="mb-1 text-left">Password</label>
        <input required type="password" class="form-control dark-input" id="password" autocomplete="off">
      </div>
      <div class="form-group w-100 mb-1">
        <label for="password-confirm" class="mb-1 text-left">Confirm password</label>
        <input required type="password" class="form-control dark-input" id="password-confirm" autocomplete="off">
      </div>
      <div class="form-group w-100 mb-1">
        <label for="description" class="mb-1 text-left">Description</label>
        <textarea class="form-control dark-input" id="description" rows="3"></textarea>
      </div>
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

export function editCredential(id, title, url, username, password, description) {
  popup.initClosePopupEvent();
  popup.fillPopupContent(editPopupContent(title));
  popup.openPopup();

  const popupContent = document.getElementById('popup-content');
  const titleInput = popupContent.querySelector('#title');
  const urlInput = popupContent.querySelector('#url');
  const usernameInput = popupContent.querySelector('#username');
  const pswInput = popupContent.querySelector('#password');
  const pswConfirmInput = popupContent.querySelector('#password-confirm');
  const descriptionInput = popupContent.querySelector('#description');

  titleInput.value = title;
  urlInput.value = url;
  usernameInput.value = username;
  pswInput.value = password;
  pswConfirmInput.value = password;
  descriptionInput.value = description;
  
  const addPasswordForm = popupContent.querySelector('#edit-credential-form');
  addPasswordForm.addEventListener("submit", async function(event) {
      event.preventDefault(); 

      try{
        if(pswInput.value !== pswConfirmInput.value) {
          showPopupInfo('Passwords are not the same.', true);
          return;
        }

        await pswTools.modifyLog(
          id, 
          titleInput.value, 
          urlInput.value, 
          usernameInput.value,
          pswInput.value, 
          descriptionInput.value);
          
          popup.closePopup();
          fillPasswordList();
      }
      catch(error){
          showPopupError(error);
      }
  
  });
}