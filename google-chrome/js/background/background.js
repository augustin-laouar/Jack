import * as manager from '../manager/manager.js';
import * as vars from '../manager/vars.js';
import { decryptWithAES } from "../tools/crypto.js";

async function waitLogin() {
    return new Promise((resolve) => {
        function messageListener(message) {
            if (message.endpoint === 'managerIgnore' && message.type === 'loginSucess') {
                resolve(true);
                chrome.runtime.onMessage.removeListener(messageListener);
            }
        }
        chrome.runtime.onMessage.addListener(messageListener);
    });
}
//AUTO FILL CREDS/EMAILS
function formatUrl(url) {
    return url.replace(/^https?:\/\//, '');
}
function getCommonPath(url1, url2) {
    const parts1 = url1.split('/');
    const parts2 = url2.split('/');
    let commonParts = [];

    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
        if (parts1[i] === parts2[i]) {
        commonParts.push(parts1[i]);
        } else {
        break;
        }
    }

    return commonParts.join('/');
}

async function find_cred_id_from_url(givenUrl) {
    const creds = await manager.directRequest('credentials', 'get', { decrypted: true});
    if(creds === null) {
        return null;
    }
    let bestMatch = null;
    let longestCommonPath = 0;
    for(const cred of creds) {
        const formattedUrl = formatUrl(cred.content.url);
        const commonPath = getCommonPath(givenUrl, formattedUrl);
        if (commonPath.length > longestCommonPath) {
          bestMatch = cred.id;
          longestCommonPath = commonPath.length;
        }
    }
    return bestMatch;
}
async function fillCredentialsFields(cred_id, tab) {
    const cred = await manager.directRequest('credentials', 'get', { id: cred_id, decrypted: true });
    const username = cred.content.username;
    const password = cred.content.password;
    const params = {
        username: username,
        password: password
    };
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (params) => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const passwordFields = form.querySelectorAll('input[type="password"]');
                const textFields = form.querySelectorAll('input[type="text"], input[type="email"]');
                if (passwordFields.length !== 1) return;
                if (textFields.length === 0) return;
    
                const signupIndicators = ['signup', 'register', 'inscription'];
                const isSignupForm = Array.from(textFields).some(field => {
                    const nameOrId = (field.name + field.id).toLowerCase();
                    return signupIndicators.some(indicator => nameOrId.includes(indicator));
                });
    
                if (isSignupForm) return;
                if (textFields.length > 1) return;
    
                const passwordField = passwordFields[0];
                const textField = textFields[0];
                textField.value = params.username;
                passwordField.value = params.password;
            });
        },
        args: [params]
    });
}

async function get_email() {
    try {
      let encryptedEmails = await manager.directRequest('emails', 'get', {});
      if(encryptedEmails.length === 0 ) {
        await manager.directRequest('emails', 'create', { random: true });
        encryptedEmails = await manager.directRequest('emails', 'get', {});
      }
      const firstEncryptedEmail = encryptedEmails[0];
      const derivedKey = vars.getDerivedKey();
      const firstEmail = await decryptWithAES(firstEncryptedEmail.email, derivedKey);
      const jsonEmail = JSON.parse(firstEmail);
      return jsonEmail.address;
    }
    catch(e) {}
}

function fillEmailField(tab, content) {
    const params = {
        email: content
    };
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (params) => {
            function insertTextIntoActiveElement(text) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    activeElement.value = text;
                }
            }
            insertTextIntoActiveElement(params.email);
        },
        args: [params]
    });
}
  
async function init() {
    try {
      const res = await manager.directRequest('session', 'isFirstLogin', null);
      if (!res) {
        chrome.contextMenus.create({
            id: "jack_fill_creds",
            title: "Use saved credentials",
            contexts: ["editable"]
        });
        chrome.contextMenus.create({
            id: "jack_random_email",
            title: "Use temporary email",
            contexts: ["editable"]
        });
      }
    }
    catch (e) {
    }
}

function notify(message) {
    if(message.endpoint === 'managerIgnore') {
        if(message.type === 'firstLogin') {
            chrome.contextMenus.create({
                id: "jack_fill_creds",
                title: "Use saved credentials",
                contexts: ["editable"]
            });
            chrome.contextMenus.create({
                id: "jack_random_email",
                title: "Use temporary email",
                contexts: ["editable"]
            });
        }
    }
}

manager.startManager();

init();
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const isUserLoggedIn = vars.getIsLogged();
    if (info.menuItemId === "jack_fill_creds") {
        const url = new URL(tab.url);
        var host = url.host;
        var path = url.pathname;
        if(!isUserLoggedIn) {
        chrome.action.setPopup({popup: "/html/ask_login.html"});
        chrome.action.openPopup();
        chrome.action.setPopup({popup: "/html/emails.html"});
        waitLogin().then(async isLoggedIn => {
            if(isLoggedIn) {
                find_cred_id_from_url(host+path).then(cred_id => {
                    if(cred_id) {
                        fillCredentialsFields(cred_id, tab);
                    }
                });
            }
        });
        }
        else {
            find_cred_id_from_url(host+path).then(cred_id => {
                if(cred_id) {
                    fillCredentialsFields(cred_id, tab);
                }
            });
        }
    }
    if (info.menuItemId === "jack_random_email") {
        if(!isUserLoggedIn) {
          chrome.action.setPopup({popup: "/html/ask_login.html"});
          chrome.action.openPopup();
          chrome.action.setPopup({popup: "/html/emails.html"});
          waitLogin().then(isLoggedIn => {
            if(isLoggedIn) {
              get_email().then(address => {
                fillEmailField(tab, address);
              });
            }
          });
        }
        else {
          get_email().then(address => {
            fillEmailField(tab, address);
          });
        }
    }
});

chrome.runtime.onMessage.addListener(notify);



//CHECK LOGIN
async function checkLogin() {
    try {
      const sessionTimeout = await manager.directRequest('session', 'timeout', null);
      if (sessionTimeout) {
        await manager.directRequest('logout', null, null);
        vars.setIsLogged(false);
        chrome.runtime.sendMessage({ endpoint: 'managerIgnore', type: 'logout', params: null});
      }
    } catch (error) {
    }
  }
  
chrome.alarms.onAlarm.addListener(async () => {
    await checkLogin();
    chrome.alarms.create({ delayInMinutes: 1 });
});
chrome.alarms.create({ delayInMinutes: 1 });


