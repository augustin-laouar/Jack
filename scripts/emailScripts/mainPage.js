import * as emailTools from './tools.js';
import * as errorManager from '../exception/errorManager.js';
import * as tools from '../tools.js';



function showError(error){
  if(!(error instanceof errorManager.Error)){
    return;
  }
  const errorStr = errorManager.errorToString(error);
  const infoLabel = document.getElementById('info');
  infoLabel.innerHTML = errorStr;
  if(error.type === 1){
    infoLabel.classList.remove('text-warning');
    infoLabel.classList.add('text-danger'); //system error
  }
  if(error.type === 2){
    infoLabel.classList.remove('text-danger');
    infoLabel.classList.add('text-warning'); //user error
  }
}

function getTrContent(address){ 
  var newAddress = address;
  if(address.length > 30){
    var newAddress = address.substring(0,30) + '...';
  }
  var codeHTML = `
    <td>
      <div class="container">
        <div class="row">
          <div class="col-8">
            <div class="d-flex align-items-center">
              <div class="mx-2">
                <div id="address-div" class="text-center">
                    <p class="text-info">${newAddress}</p>
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
    const addressList = emailTools.getEmailList(); 
    const tab = document.querySelector('#tab-body');
    tab.innerHTML = ''; 
    for(const emailId of addressList) {
      var myMail = await emailTools.getEmailAddressAssociated(emailId);
      const trElement = document.createElement('tr');
      trElement.innerHTML = getTrContent(myMail);
      const addressDiv = trElement.querySelector('#address-div');
      addressDiv.style.cursor = 'pointer';
      addressDiv.addEventListener('click', function(){
        const url = browser.runtime.getURL('../../html/mailBox.html') + '?emailId=' + encodeURIComponent(emailId);
        browser.tabs.create({ url });
      });
      const deleteButton = trElement.querySelector('#delete-button');
      deleteButton.addEventListener('click', async function(){
        try{
          await emailTools.deleteAccountStored(emailId);
          fillAddressList();
        }
        catch(error){
          showError(error);
        }
      });
      tab.appendChild(trElement);
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
        await emailTools.createAndStoreAccount(addressInput.value, passwordInput.value);
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
        await emailTools.createAndStoreRandomAccount();
      }
      catch(error){
        showError(error);
      }
      fillAddressList();
    });

    var logOutButton = document.getElementById('log-out');
    logOutButton.addEventListener("click", async function(event){
      tools.logout(true);
    });
    var settingsButton = document.getElementById('settings');
    settingsButton.addEventListener("click", async function(event){
      const url = browser.runtime.getURL('../../html/settings.html');
      browser.tabs.create({ url });
    });
});