import * as emailTools from './email_tools.js';


function fillAddressList(){
    const addressList = emailTools.getEmailList(); // Récupérer la liste d'adresses e-mail

    // Récupérer les éléments HTML
    const h1Element = document.querySelector('h1');
    const ulElement = document.querySelector('#address-list');
  
    // Remplir le contenu de l'élément <h1>
    h1Element.textContent = 'E-mail created';
  
    // Remplir le contenu de la liste <ul>
    ulElement.innerHTML = ''; // Réinitialiser la liste
  
    addressList.forEach((emailEntry) => {
      const { email } = emailTools.getEmailAndPassword(emailEntry); // Récupérer l'adresse e-mail
  
      // Créer un élément <li> avec l'adresse e-mail et le bouton "Consulter"
      const liElement = document.createElement('li');
      liElement.textContent = email;
  
      const buttonElement = document.createElement('button');
      buttonElement.textContent = 'Consulter';
  
      liElement.appendChild(buttonElement);
      ulElement.appendChild(liElement);
    });
}

async function addAddress(addr,psw) {
    var res = await emailTools.createAccount(addr,psw);
    if(res) {
        var addressList = emailTools.getEmailList();
        var newAddr = addr + ';' + psw;
        addressList.push(newAddr);
        emailTools.storeEmailList(addressList);
    }
    else {
        console.log("error creating email");
    }   
}






fillAddressList();

document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("create-email-form");
    form.addEventListener("submit",async function(event) {
      console.log("test");
      event.preventDefault();
      var addressInput = document.getElementById("address");
      var passwordInput = document.getElementById("password");
  
      await addAddress(addressInput.value, passwordInput.value);
  
      addressInput.value = "";
      passwordInput.value = "";
  
      fillAddressList();
    });
  });