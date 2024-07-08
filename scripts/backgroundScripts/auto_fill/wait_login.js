import { isLogged } from "../../login_tools.js";

export async function checkLogin() {
    const res = await isLogged();
    return res;
}

export async function waitLogin() {
    return new Promise((resolve) => {
        function messageListener(message) {
            if (message.subject === 'isLogged') {
                if (message.status === true) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                browser.runtime.onMessage.removeListener(messageListener);
            }
        }
        browser.runtime.onMessage.addListener(messageListener);
    });
}