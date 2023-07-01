// Récupération de la liste d'URL depuis le Local Storage
var urlList = localStorage.getItem('urlList');
if (urlList) {
  var urls = urlList.split(';'); // Séparation des URL en utilisant le point-virgule comme délimiteur

  // Création du tableau HTML
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
    var urlData = localStorage.getItem("url_"+url);

    if (urlData) {
      var userData = urlData.split(';');
      var username = userData[0];
      var password = userData[1];

      // Création d'une ligne dans le tableau pour chaque URL
      var row = document.createElement('tr');
      var urlCell = document.createElement('td');
      urlCell.textContent = url;
      var usernameCell = document.createElement('td');
      usernameCell.textContent = username;
      var passwordCell = document.createElement('td');
      passwordCell.textContent = password;

      row.appendChild(urlCell);
      row.appendChild(usernameCell);
      row.appendChild(passwordCell);
      table.appendChild(row);
    }
  }

  // Ajout du tableau au document HTML
  document.body.appendChild(table);
}
