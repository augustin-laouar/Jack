import * as request from './manager/manager_request.js';


const isLogged = await request.makeRequest('session', 'check', null);
if(!isLogged) {
    const isFirstLogin = await request.makeRequest('session', 'isFirstLogin', null);
    if(isFirstLogin) {
        window.location.href = "/html/firstConnection.html";
    }
    else {
        window.location.href = "/html/login.html";
    }
}

browser.runtime.onMessage.addListener(notify);

function notify(message) {
    if(message.type === 'logout') {
        window.location.href = "/html/login.html";
    }
}