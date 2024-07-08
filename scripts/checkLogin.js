import * as tools from './login_tools.js';

const isLogged = await tools.isLogged();
if(!isLogged) {
    if(await tools.isFirstLogin()) {
        window.location.href = "/html/firstConnection.html";
    }
    else {
        window.location.href = "/html/login.html";
    }
}