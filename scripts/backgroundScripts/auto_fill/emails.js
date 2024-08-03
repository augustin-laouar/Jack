import { waitLogin } from "./wait_login.js";
import { directRequest  } from "../../manager/manager.js";
import { decryptWithAES } from "../../tools/crypto.js";
import { getDerivedKey } from "../../manager/vars.js";

async function get_email() {
  try {
    let encryptedEmails = await directRequest('emails', 'get', {});
    if(encryptedEmails.length === 0 ) {
      await directRequest('emails', 'create', { random: true });
      encryptedEmails = await directRequest('emails', 'get', {});
    }
    const firstEncryptedEmail = encryptedEmails[0];
    const derivedKey = getDerivedKey();
    const firstEmail = await decryptWithAES(firstEncryptedEmail.email, derivedKey);
    const jsonEmail = JSON.parse(firstEmail);
    return jsonEmail.address;
  }
  catch(e) {}
}
export function fillField(tab, content) {
  const params = {
    email: content
  };
  browser.tabs.executeScript(tab.id, {
    code: `
    (function() {
      const params = ${JSON.stringify(params)};
      function insertTextIntoActiveElement(text) {
        var activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          activeElement.value = text;
        }
      }
      insertTextIntoActiveElement(params.email);
      })();
    `    
  });
}

function notify(message) {
  if(message.endpoit === 'logout') {
    isUserLoggedIn = false;
  }
  if(message.endpoint === 'managerIgnore') {
    if(message.type === 'logout') {
      isUserLoggedIn = false;
    }
    if(message.type === 'loginSucess') {
      isUserLoggedIn = true;
    }
    if(message.type === 'firstLogin') {
      browser.contextMenus.create({
        id: "jack_random_email",
        title: "Use temporary email",
        contexts: ["editable"]
      });
    }
  }
}

async function init() {
  try {
    const res = await directRequest('session', 'isFirstLogin', null);
    if (!res) {
      browser.contextMenus.create({
        id: "jack_random_email",
        title: "Use temporary email",
        contexts: ["editable"]
      });
    }
  }
  catch (e) {
  }
}

let isUserLoggedIn = false;
init();

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jack_random_email") {
    if(!isUserLoggedIn) {
      browser.browserAction.setPopup({popup: "/html/askLogin.html"});
      browser.browserAction.openPopup();
      browser.browserAction.setPopup({popup: "/html/emails.html"});
      waitLogin().then(isLoggedIn => {
        if(isLoggedIn) {
          get_email().then(address => {
            fillField(tab, address);
          });
        }
      });
    }
    else {
      get_email().then(address => {
        fillField(tab, address);
      });
    }
  }
});

browser.runtime.onMessage.addListener(notify);



