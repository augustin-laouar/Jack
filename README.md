# Jack's Mails

## todo
- Ajouter sur chrome
- Rajouter la possibilité de clic droit pour utiliser une email directement
- Enregistrement automatique de mots de passes lorsque l'on s'inscrit sur un site
- ajouter petit bouton copier à côter du nom de l'email
- Nouveau CSS 
- changer logs/passwords par credentials / connectionDuration par sessionValidity
- Dans local storage : utiliser des _ et pas ecriture java
- Ajouter le nom des boutons au survol
- bouton pour afficher le mot de passe lors de l'édition
- Pour les pages autre que email : les boutons de navigation ouvre la page dans la meme fenetre
## Bugs 
- API error quand on ouvre un mail
- le mail reste en non lu
- Lors de la recherche de credentials, lorsque l'on change la méthode de recherche ça ne refresh pas
- Error api lorsque l'on delete + il faut supprimer le contenu du mail a droite
## Tache actuel
- Robustesse du mot de passe
- password generator personalisé : modification d'un existant, ajout initial du generateur par défaut (qui n'a pas de bouton delete ou modifier).
- Pas plus de 20 generators
- Mettre le code dans un fichier a part
- Bug generate password -> Dans rand char on utilise un string et pas une liste 
## Terminé
- Stocker logs via des ids et non url 
- Modification du password 
- Code refactoring 
- Lors de création d'email, inutile de spécifier le password du compte.
- Ajouter la possibilitée de filtrer avec le username
- Ajouter barre des tâches dans password.html
- Icons
- email page design
- import/export 
- Style settings page
- faire un bouton de reset account
- style css button
- choix du nom de domaine => On peut voir une liste de domaines à côté du nom que l'on choisit pour l'addresse mail.
- Ajouter du sel dans le hash du psw
- Champ description et titre pour les passwords
- Add/edit password avec fake popup
- sort psw by title
- style tableau password
- génération de mdp aléatoire pour credentials
