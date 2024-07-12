import { waitLogin } from "./wait_login.js";
import { find_cred_id_from_url } from "../../password/credentials_finder.js";
import { isFirstLogin } from "../../login_tools.js";

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
                console.log(cred_id);
                //todo : envoyé un message avec les creds pour fill 
            });
        }
      });
    }
    else {
        find_cred_id_from_url(host+path).then(cred_id => {
            console.log(cred_id);
        });
    }
  }
});

browser.runtime.onMessage.addListener(notify);

