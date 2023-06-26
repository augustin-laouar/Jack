import * as emailTools from './email_tools.js';


function fillAddressList(){
    const addressList = emailTools.getEmailList(); 
    const ulElement = document.querySelector('#address-list');
  
    //fill <ul> list
    ulElement.innerHTML = ''; 

    for(const emailId of addressList) {
      var mail = emailTools.getEmailAddressAssociated(emailId);
      const liElement = document.createElement('li');    
      liElement.textContent = mail;
      const buttonElement = document.createElement('button');
      const buttonId = 'button-email-' + emailId; // ID unique pour chaque bouton
      buttonElement.setAttribute('id', buttonId);
      buttonElement.textContent = 'Consult';
  
      buttonElement.addEventListener('click', function () {
        const url = browser.runtime.getURL('../html/mailBox.html') + '?emailId=' + encodeURIComponent(emailId);
        browser.tabs.create({ url });
      });
      liElement.appendChild(buttonElement);
      ulElement.appendChild(liElement);

    }
}


fillAddressList();
document.addEventListener("DOMContentLoaded", function() {
  var addEmailForm = document.getElementById("add-email");
  addEmailForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    var addressInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    await emailTools.createAndStoreAccount(addressInput.value, passwordInput.value);
    fillAddressList();
    addressInput.value = '';
    passwordInput.value = '';
  });
  var randomAddressButton = document.getElementById("randomAddress");
  randomAddressButton.addEventListener("click", async function(event){
    await emailTools.createAndStoreRandomAccount();
    fillAddressList();
  });
});


