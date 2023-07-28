import * as pswTools from './tools.js';


async function refresh() {
  // Récupération de la liste d'URL depuis le Local Storage
  const logsList = pswTools.getLogsList();
  // Supprime l'ancien contenu du tableau
  var table = document.createElement('table');
  var headerRow = document.createElement('tr');
  var urlHeader = document.createElement('th');
  urlHeader.textContent = 'URL';
  var usernameHeader = document.createElement('th');
  usernameHeader.textContent = 'Username';
  var passwordHeader = document.createElement('th');
  passwordHeader.textContent = 'Password';

  headerRow.appendChild(urlHeader);
  headerRow.appendChild(usernameHeader);
  headerRow.appendChild(passwordHeader);
  table.appendChild(headerRow);

  // Parcours des URL
  for (var i = 0; i < logsList.length; i++) {
    const logsUrl = logsList[i];
    const logsData = await pswTools.getLogs(logsUrl);   
    if (logsData !== null) {
      const username = logsData.id;
      const password = logsData.password;
      const url = logsData.url;
      // Création d'une ligne dans le tableau pour chaque URL
      var row = document.createElement('tr');
      var urlCell = document.createElement('td');
      urlCell.textContent = url;
      var usernameCell = document.createElement('td');
      usernameCell.textContent = username;
      var passwordCell = document.createElement('td');

      // Création du bouton de copie
      var copyButton = document.createElement('button');
      copyButton.textContent = 'Copier';
      copyButton.addEventListener('click', function () {
        copyToClipboard(password);
      });

      passwordCell.appendChild(copyButton);
      row.appendChild(urlCell);
      row.appendChild(usernameCell);
      row.appendChild(passwordCell);
      table.appendChild(row);
    }
  }

  // Remplace le contenu existant de la liste des URL par le nouveau tableau
  var urlListElement = document.getElementById('url-list');
  urlListElement.innerHTML = '';
  urlListElement.appendChild(table);
}

// Fonction pour copier le texte dans le presse-papiers
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Impossible de copier le texte :', error);
  }
}

document.addEventListener("DOMContentLoaded", function() { //on attend que la page se charge
    refresh();
    const pwdForm = document.getElementById("pwdForm");
    pwdForm.addEventListener("submit", async function(event) {
      event.preventDefault(); //on supprime le comportement par defaut de submit 
      var id = document.getElementById("id");
      var pwd = document.getElementById("password");
      var url = document.getElementById("url");
      await pswTools.createLogs(url.value,id.value, pwd.value);
      id.value = '';
      pwd.value = '';
      url.value = '';
      refresh();
    });

});
