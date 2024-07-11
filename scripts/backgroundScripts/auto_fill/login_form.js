import { find_cred_id_from_url } from "/scripts/password/credentials_finder.js";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    notify(message).then(cred_id => {
      sendResponse({type: 'login_form', cred_id: cred_id});
    }).catch(e => {
      sendResponse({ type: 'login_form', error: true });
    });
    return true;
});

async function notify(message) {
    if(message.type === 'loginForm') {
        const cred_id = await find_cred_id_from_url(message.url);
        if(cred_id) {
            //todo : ask login form
        }
    }
}

