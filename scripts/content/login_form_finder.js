function detectLoginForm() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        const textFields = form.querySelectorAll('input[type="text"], input[type="email"]');
        //const inputFields = form.querySelectorAll('input, select, textarea');
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
        const passwordField = passwordFields[0];
        const textField = textFields[0];
        const host = window.location.host;
        const pathname = window.location.pathname;
        const url = host + pathname;

        browser.runtime.sendMessage({ type: 'loginForm', url: url }).then(response => {
            //todo
        });   
    });
}


detectLoginForm();
// for dynamic detection 
const observer = new MutationObserver(detectLoginForm);
observer.observe(document.body, { childList: true, subtree: true });