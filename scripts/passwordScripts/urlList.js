import * as pwd_tools from './tools.js';

export async function refresh() {
  // Récupération de la liste d'URL depuis le Local Storage
  var urlList = localStorage.getItem('urlList');
  if (urlList) {
    var urls = urlList.split(';'); // Séparation des URL en utilisant le point-virgule comme délimiteur

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
    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];
      var urlData = localStorage.getItem("url_" + url);

      if (urlData) {
        var userData = urlData.split(';');
        var username = userData[0];
        var key = await pwd_tools.getAesKey();
        var password = await pwd_tools.decryptWithAESKey(userData[1], key);

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
}

// Fonction pour copier le texte dans le presse-papiers
function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
