import { directRequest } from "../../manager/manager.js";

export async function checkLogin() {
    const result = await directRequest('session', 'check', null);
    return result;
}

export async function waitLogin() {
    return new Promise((resolve) => {
        function messageListener(message) {
            if (message.endpoit === 'login') {
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