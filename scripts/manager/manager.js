import * as error from '../exception/error.js';
import * as loginHandler from './handlers/login.js';
import * as logoutHandler from './handlers/logout.js';
import * as sessionHandler from './handlers/session.js';
import * as sessionDurationHandler from './handlers/session_duration.js';
import * as passwordHandler from './handlers/password.js';
import * as credentialsHandler from './handlers/credentials.js';
import * as emailsHandler from './handlers/emails.js';
import * as generatorsHandler from './handlers/generators.js';
import * as importHandler from './handlers/import.js';
import * as exportHandler from './handlers/export.js';
import * as resetHandler from './handlers/reset.js';

/*
MESSAGE STRUCTURE :
* endpoint : point of interaction between the client and the manager
* type : request type (update, get, delete...)
* params : additional parameters
*/
//handle the request. If nothing to return, return null
async function handleRequest(message) {
    if (message.endpoint === "login") {
        const result = await loginHandler.handle(message);
        return result;
    }
    if (message.endpoint === "logout") { 
        const result = await logoutHandler.handle();
        return result;
    }
    if (message.endpoint === "session") { // check session validity
        const result = await sessionHandler.handle(message);
        return result;
    }
    if (message.endpoint === "sessionDuration") { // update sessionDuration variable 
        const result = await sessionDurationHandler.handle(message);
        return result;
    }
    if (message.endpoint === "password") { // master password
        const result = await passwordHandler.handle(message);
        return result;
    }
    if (message.endpoint === "credentials") { // Credentials (get (id), get all, delete, update, add ...)
        const result = await credentialsHandler.handle(message);
        return result;
    }
    if (message.endpoint === "emails") { // Emails  
        const result = await emailsHandler.handle(message);
        return result;
    }
    if (message.endpoint === "generators") { 
        const result = await generatorsHandler.handle(message);
        return result;
    }
    if (message.endpoint === "import") { 
        const result = await importHandler.handle(message);
        return result;
    }
    if (message.endpoint === "export") { 
        const result = await exportHandler.handle(message);
        return result;
    }
    if (message.endpoint === "reset") { 
        const result = await resetHandler.handle(message);
        return result;
    }
    throw new error.Error("Manager : Unknown endpoint.", false);
}   

export async function directRequest(endpoint, type, params) {
    try {
        const message = {
            endpoint: endpoint,
            type: type,
            params: params
        };
        const response = await handleRequest(message);
        if(response.error) {
            throw new error.castError(e);
        }
        return response;
    }
    catch(e) {
        throw new error.castError(e);
    }
}
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {   
    if(message.endpoint === 'managerIgnore') {
        return true;
    }
    handleRequest(message)
    .then(result => {
        sendResponse({ result: result });
    })
    .catch(e => {
        sendResponse({ error: e });
    });
    return true;
});