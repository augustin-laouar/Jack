import { waitLogin } from "./wait_login.js";
import * as credentials_storage from "/scripts/password/tools.js";
import { isFirstLogin } from "../../login_tools.js";

async function get_credentials(url) {
  try {
  }
  catch(e) {}
}
function fillFields(tab, username, password) {
  const params = {
    username: username,
    passowrd: password
  };
  browser.tabs.executeScript(tab.id, {
    code: `
    (function() {
      const params = ${JSON.stringify(params)};
      })();
    `
  });
}


function notify(message) {
    if(message.type === 'logout') {
      isUserLoggedIn = false;
    }
    if(message.type === 'login') {
      isUserLoggedIn = true;
    }
    if(message.type === 'init') {
      browser.contextMenus.create({
        id: "jack_",
        title: "Use saved credentials",
        contexts: ["editable"]
      });
    }
}

let isUserLoggedIn = false;

isFirstLogin().then(res => {
  if(!res) {
    browser.contextMenus.create({
      id: "jack_fill_username",
      title: "Use saved credentials",
      contexts: ["editable"]
    });
  }
});


browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jack_fill_cred") {
    if(!isUserLoggedIn) {
      browser.browserAction.setPopup({popup: "/html/askLogin.html"});
      browser.browserAction.openPopup();
      browser.browserAction.setPopup({popup: "/html/emails.html"});
      const url = tab.url;
      waitLogin().then(isLoggedIn => {
        if(isLoggedIn) {
            get_credentials().then(credentials => {
                fillFields(tab, credentials.username, credentials.password);
            });
        }
      });
    }
    else {
        get_credentials().then(credentials => {
            fillFields(tab, credentials.username, credentials.password);
        });
    }
  }
});

browser.runtime.onMessage.addListener(notify);

