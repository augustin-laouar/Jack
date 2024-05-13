# Jack's Mails


## todo
- Stocker logs via des ids et non url x
- Modification du password x
- Export/Import config
- Ajouter sur chrome
- Review email style
- Code refactoring
- Bug : LogList supprimé après DECO
- changer localstorage par browserStorage.
- Ajouter la possibilitée de filtrer avec le username

## Bugs 
- API error quand on ouvre un mail
- le mail reste en non lu

## Step 
- Modifier toutes les méthodes ou il y a un appel à localStorage
- Voir comment faire le stockage des listes d'email et credential
- Modifier toutes les méthodes de crypto pour qu'elle fasse appels à tools/crypto.js
- Modifier toutes les générations d'ID pour qu'elles fasse appel à tools/id.js
- Modifier le stockage des listes (psw et email) : tout est stocké dans le même objet. Plus de stockage d'email/password et de liste d'id séparément.
- Séparer les fichiers en plusieurs sous fichier => Un fichier par fonctionnalité
- Simplifier la gestions des Erreurs. Cela pourrait être un simple message + un code pour savoir quoi affiché à l'utilisateur



## Etat actuel
- Modification de la méthode de stockage des credentials et emails
- Modifier le reste du code pour ne plus utiliser 
- ChangePassword : bug
- stocker le hashedpsw dans la mémoire extension
- Bug impossible de se connecter. Problème vient surement du fait que il n'arrive pas a obtenir le bon résultat dans la fonction checkLogin
