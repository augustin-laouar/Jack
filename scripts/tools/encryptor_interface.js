import { Error } from "../exception/error.js";

export async function encrypt(data) {
    try {
        const response = await browser.runtime.sendMessage({type: "encrypt", data: data, temp: false});
        return response.uncryptedData;
    }
    catch(e) {
        throw new Error('Error when encrypting data.', false);
    }
}

export async function decrypt(data) {
    try {
        const response = await browser.runtime.sendMessage({type: "decrypt", data: data, temp: false});
        return response.decryptedData;
    }
    catch(e) {
        throw new Error('Error when decrypting data.', false);
    }
}

export async function genereateKey(password) {
    let response;
    try {
        response = await browser.runtime.sendMessage({type: "generate_key", password: password, temp: false});
    }
    catch(e) {
        throw new Error('Error generating AES key.', false);
    }
    if(!response.success) {
        throw new Error('Error generating AES key.', false);
    }
}

export async function genereateTempKey(password) {
    let response;
    try {
        response = await browser.runtime.sendMessage({type: "generate_key", password: password, temp: true});
    }
    catch(e) {
        throw new Error('Error generating AES key.', false);
    }
    if(!response.success) {
        throw new Error('Error generating AES key.', false);
    }
}

export async function encryptWithTempKey(data) {
    try {
        const response = await browser.runtime.sendMessage({type: "encrypt", data: data, temp: true});
        return response.uncryptedData;
    }
    catch(e) {
        throw new Error('Error when encrypting data.', false);
    }
}

export async function decryptWithTempKey(data) {
    try {
        const response = await browser.runtime.sendMessage({type: "decrypt", data: data, temp: true});
        return response.decryptedData;
    }
    catch(e) {
        throw new Error('Error when decrypting data.', false);
    }
}

export async function switchKey() {
    try {
        browser.runtime.sendMessage({type: "switch_key"});
    }
    catch(e) {
        throw new Error('Error switching keys.', false);
    }
}