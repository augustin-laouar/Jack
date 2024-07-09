import { waitLogin } from "./wait_login.js";
import * as email_storage from "/scripts/email/storage_tools.js";


async function get_email() {
  try {
    let emails = await email_storage.getDecrytpedEmails();
    if(emails.length === 0 ) {
      await email_storage.createRandomEmail();
      emails = await email_storage.getDecrytpedEmails();
    }
    return emails[0].email.address;
  }
  catch(e) {}
}
function fillField(tab, content) {
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

let isUserLoggedIn = false;

browser.contextMenus.create({
  id: "jack_random_email",
  title: "Use temporary email",
  contexts: ["editable"]
});


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

function notify(message) {
    if(message.type === 'logout') {
      isUserLoggedIn = false;
    }
    if(message.type === 'login') {
      isUserLoggedIn = true;
    }
}


