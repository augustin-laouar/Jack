# Jack's Mails


## todo
- Stocker logs via des ids et non url x
- Modification du password x
- Export/Import config
- Ajouter sur chrome
- Review email style
- Code refactoring
- Ajouter la possibilitée de filtrer avec le username

## Bugs 
- API error quand on ouvre un mail
- le mail reste en non lu

## Step 
- Simplifier la gestions des Erreurs. Cela pourrait être un simple message + un code pour savoir quoi affiché à l'utilisateur
- Lors de création d'email, inutile de spécifier le password du compte.
- Modifier la fonction storage.read => Retourner null si la data n'existe pas, sinon renvoyé directement la donnée (sans devoir faire data.email par exemple)
- Changer les 'connexion' par 'connection'


## Etat actuel
