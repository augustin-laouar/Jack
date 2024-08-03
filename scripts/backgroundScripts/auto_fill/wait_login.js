import { directRequest } from "../../manager/manager.js";

export async function checkLogin() {
    const result = await directRequest('session', 'check', null);
    return result;
}

export async function waitLogin() {
    return new Promise((resolve) => {
        function messageListener(message) {
            if (message.endpoint === 'managerIgnore' && message.type === 'loginSucess') {
                resolve(true);
                browser.runtime.onMessage.removeListener(messageListener);
            }
        }
        browser.runtime.onMessage.addListener(messageListener);
    });
}