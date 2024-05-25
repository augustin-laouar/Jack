import * as storage from './storage_tools.js';
import * as tools from '../tools.js';
import * as error from '../exception/error.js';

function showError(e){
  if(!(e instanceof error.Error)){
    return;
  }
  const message = error.errorToString(e);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = message;
}

function getTrContent(address){ 
  var codeHTML = `
    <td>
      <div class="container">
        <div class="row">
          <div class="col-8">
            <div class="d-flex align-items-center">
              <div class="mx-2">
                <div id="address-div" class="text-center" style=" max-width: 300px;overflow-x: auto;">
                    <p class="text-info" style="white-space: nowrap;">${address}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="d-flex align-items-center justify-content-center">
              <div class="text-center">
                <button id="delete-button" class="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </td>`;
  return codeHTML;


}
async function fillAddressList(){
  try{
    const emails = await storage.getDecrytpedEmails(); 
    const tab = document.querySelector('#tab-body');
    tab.innerHTML = ''; 
    if(emails.length === 0){
      tab.innerHTML = '<p class="lead">No address for the moment.</p>';
    }
    else{
      for(const email of emails) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = getTrContent(email.email.address);
        const addressDiv = trElement.querySelector('#address-div');
        addressDiv.style.cursor = 'pointer';
        addressDiv.addEventListener('click', function(){
          const url = browser.runtime.getURL('../../html/mailBox.html') + '?emailId=' + encodeURIComponent(email.id);
          browser.tabs.create({ url });
        });
        const deleteButton = trElement.querySelector('#delete-button');
        deleteButton.addEventListener('click', async function(){
          try{
            await storage.deleteEmail(email.id);
            fillAddressList();
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


document.addEventListener("DOMContentLoaded", function() {
    fillAddressList();
    var addEmailForm = document.getElementById("add-email");
    addEmailForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      var addressInput = document.getElementById("email");
      var passwordInput = document.getElementById("password");
      try{
        await storage.createEmail(addressInput.value, passwordInput.value);
      }
      catch(error){
        showError(error);
      }
      fillAddressList();
      addressInput.value = '';
      passwordInput.value = '';
      
    });
    const randomAddressButton = document.getElementById("randomAddress");
    randomAddressButton.addEventListener("click", async function(event){
      try{
        await storage.createRandomEmail();
      }
      catch(error){
        showError(error);
      }
      fillAddressList();
    });

    const logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      tools.logout(true);
    });
    const settingsButton = document.getElementById('settings');
    settingsButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/settings.html');
      browser.tabs.create({ url });
    });
    const helpButton = document.getElementById('help');
    helpButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/help.html');
      browser.tabs.create({ url });
    });
    const passwordButton = document.getElementById('password-button');
    passwordButton.addEventListener("click", function(){
      const url = browser.runtime.getURL('../../html/passwords.html');
      browser.tabs.create({ url });
    });
});