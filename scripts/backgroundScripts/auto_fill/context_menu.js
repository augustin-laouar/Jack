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
      isUserLoggedIn = isLoggedIn;
    });
    if(!isUserLoggedIn) {
      browser.browserAction.setPopup({popup: "/html/askLogin.html"});
      browser.browserAction.openPopup()
      browser.browserAction.setPopup({popup: "/html/emails.html"});
      waitLogin().then(isLoggedIn => {
        if(isLoggedIn) {
          console.log('logged via popup');
          fillField(tab, '');
        }
      });
    }
    else {
      console.log('already logged');
      fillField(tab, '');
    }
  }
});

function fillField(tab, content) {
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