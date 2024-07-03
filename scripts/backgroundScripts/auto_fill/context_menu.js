import { isLogged } from "../../login_tools.js";
import { checkLogin, waitLogin } from "./wait_login.js";

let isUserLoggedIn = false;

browser.contextMenus.create({
  id: "random_email",
  title: "Use random email",
  contexts: ["editable"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "random_email") {
    checkLogin().then(isLoggedIn => {
      if (!isLoggedIn) {
        isUserLoggedIn = false;
      } else {
        isUserLoggedIn = true;
      }
    });

    if(!isUserLoggedIn) {
      browser.browserAction.openPopup();
      //waitLogin
    }
    const params = {
      email: 'test@example.com'
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
});