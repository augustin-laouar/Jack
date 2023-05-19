// Vérifier si l'utilisateur est déjà connecté
var isLoggedIn = localStorage.getItem('isLogged');
if (!isLoggedIn) {
  // Rediriger l'utilisateur vers la page de connexion
  window.location.href = '../html/login.html';
}