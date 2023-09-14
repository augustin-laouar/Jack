# locker

Author : LAOUAR Augustin & Thinhinane ZEDDAM

## Login page 
To get access to the application, you need to enter your "master password". We store the sha256 encryption of this password into the local storage of the browser.
We use crypto API : window.crypto.subtle.digest('SHA-256', data); .
We also store the last login date. On every other pages than login.html, we check how much time there is since the last login. If last login date is older than x minutes (actually x = 1), we redirect to login.html. It the last login date data does not exist, we redirect to login.html.
Scripts used are in login.js, tools.js and verify auth.js .


## Structure
### background.js
A script run permanently in background, even if the extension is not open.

### tools.js
Every js function that could be usfull in other scripts, for example "isLogged()".

### content-script.js
Not used now.

## TODO

### Augustin 
- Une seule variable pour les adresses mails/mdp (list format json) -> a voir plus tard
- Amelioration : ne plus stocké les logs avec l'url mais avc une chaine aléatoire

- Barre de recherche psw
- Gérer les url trop longues psw
- faire page help 