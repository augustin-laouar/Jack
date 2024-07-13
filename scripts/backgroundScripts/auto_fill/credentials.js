import { waitLogin } from "./wait_login.js";
import { find_cred_id_from_url } from "../../password/credentials_finder.js";
import { isFirstLogin } from "../../login_tools.js";
import { getDecryptedLog } from "../../password/tools.js";

function notify(message) {
    if(message.type === 'logout') {
      isUserLoggedIn = false;
    }
    if(message.type === 'login') {
      isUserLoggedIn = true;
    }
    if(message.type === 'init') {
      browser.contextMenus.create({
        id: "jack_fill_creds",
        title: "Use saved credentials",
        contexts: ["editable"]
      });
    }
}

let isUserLoggedIn = false;

isFirstLogin().then(res => {
  if(!res) {
    browser.contextMenus.create({
      id: "jack_fill_creds",
      title: "Use saved credentials",
      contexts: ["editable"]
    });
  }
});

async function fillFields(cred_id, tab) {
    const cred = await getDecryptedLog(cred_id);
    const username = cred.content.username;
    const password = cred.content.password;
    const params = {
        username: username,
        password: password
    };
    browser.tabs.executeScript(tab.id, {
    code: `
    (function() {
        const params = ${JSON.stringify(params)};
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
                textField.text = username;
                passwordField.text = password;
            });
        }
        detectLoginForm(params.username, params.password);
    })();
    `    
    });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jack_fill_creds") {
    if(!isUserLoggedIn) {
      browser.browserAction.setPopup({popup: "/html/askLogin.html"});
      browser.browserAction.openPopup();
      browser.browserAction.setPopup({popup: "/html/emails.html"});
      const url = new URL(tab.url);
      var host = url.host;
      var path = url.pathname;
      waitLogin().then(async isLoggedIn => {
        if(isLoggedIn) {
            find_cred_id_from_url(host+path).then(cred_id => {
                if(cred_id) {
                    fillFields(cred_id, tab);
                }
            });
        }
      });
    }
    else {
        find_cred_id_from_url(host+path).then(cred_id => {
            if(cred_id) {
                fillFields(cred_id, tab);
            }
        });
    }
  }
});

browser.runtime.onMessage.addListener(notify);

