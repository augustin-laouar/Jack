function detectLoginForm() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        const textFields = form.querySelectorAll('input[type="text"], input[type="email"]');
        const inputFields = form.querySelectorAll('input, select, textarea');
        console.log(textFields.length);
        if (passwordFields.length !== 1) {
            return;
        }
        if (textFields.length === 0) {
            return;
        }

        const signupIndicators = ['signup', 'register', 'inscription'];
        const isSignupForm = Array.from(textFields).some(field => {
            const nameOrId = (field.name + field.id).toLowerCase();
            return signupIndicators.some(indicator => nameOrId.includes(indicator));
        });

        if (isSignupForm) {
            return;
        }

        if (textFields.length > 1) {
            return;
        }
        //TODO : Prendre en compte le fait qu'il est possible que certains formulaires de connexion n'ont qu'un mot de passe ou qu'un champ email
        console.log('Formulaire de connexion détecté:', form);
    });
}


detectLoginForm();
// for dynamic detection 
const observer = new MutationObserver(detectLoginForm);
observer.observe(document.body, { childList: true, subtree: true });