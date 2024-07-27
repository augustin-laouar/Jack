import * as crypto from "../tools/crypto.js";

let derivedKey = null;
let tempDerivedKey = null;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {   
    if (message.type === "generate_key") {
        crypto.generateDerivedKey(message.password).then(key => {
            if(message.temp){
                tempDerivedKey = key;
            }
            else{
                derivedKey = key;
            }
            sendResponse({success: true});
        });
        return true;
    }
    if (message.type === "encrypt") {
        if(message.temp){
            crypto.encryptWithAES(message.data, tempDerivedKey).then(uncryptedData => {
                sendResponse({uncryptedData: uncryptedData});
            });
        }
        else {
            crypto.encryptWithAES(message.data, derivedKey).then(uncryptedData => {
                sendResponse({uncryptedData: uncryptedData});
            }); 
        }
        return true;
    }
    if (message.type === "decrypt") {
        if(message.temp) {
            crypto.decryptWithAES(message.data, tempDerivedKey).then(decryptedData => {
                sendResponse({decryptedData: decryptedData});
            });
        }
        else {
            crypto.decryptWithAES(message.data, derivedKey).then(decryptedData => {
                sendResponse({decryptedData: decryptedData});
            });
        }
        return true;
    }
    if (message.type === "switch_key") {
        derivedKey = tempDerivedKey;
        tempDerivedKey = null;
        return true;
    }
    if (message.type === "logout") {
        derivedKey = null;
        tempDerivedKey = null;
        return true;
    }
    return false;
});