function checkTimeElapsed() {
    // Obtenir la date et l'heure actuelles
    const now = new Date();
  
    // Ajouter 15 minutes à la date stocké
    const storedDate = localStorage.getItem('lastLogin');
    if(storedDate === null){
        return;
    }
    const parsedDate = new Date(storedDate);
    const timeElapsed = new Date(parsedDate.getTime() + (1 * 60 * 1000));

    // Comparer la date actuelle avec la date après 15 minutes
    if (now >= timeElapsed) {
        localStorage.setItem("isLogged", false);
        window.location.href = "../html/login.html";
    }
  }

checkTimeElapsed();
// Définir isLogged à false lors de la fermeture de la page
window.addEventListener('beforeunload', function(event) {
    localStorage.setItem('isLogged', 'false');
  });
  
