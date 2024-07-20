function detectSignupForm() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        const confirmPasswordFields = form.querySelectorAll('input[type="password"][name*="confirm"], input[type="password"][id*="confirm"]');
        const usernameFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[name="username"], input[name="email"]');
        const additionalFields = form.querySelectorAll('input[type="text"][name*="name"], input[type="text"][id*="name"]');

        if (passwordFields.length > 0 && usernameFields.length > 0 && (confirmPasswordFields.length > 0 || additionalFields.length > 0)) {
            const host = window.location.host;
            const pathname = window.location.pathname;
            const url = host + pathname;

            console.log('Signup form detected:', form);
        }
    });
}

detectSignupForm();

// Pour la détection dynamique des nouveaux formulaires ajoutés au DOM
const signupFormObserver = new MutationObserver(detectSignupForm);
signupFormObserver.observe(document.body, { childList: true, subtree: true });
