import * as error from '../exception/error.js';

export async function makeRequest(endpoint, type, params) {
    try {
        const message = {
            endpoint: endpoint,
            type: type,
            params: params
        };
        const response = await browser.runtime.sendMessage(message);
        if(response.error) {
            throw new error.castError(response.error);
        }
        return response.result;
    }
    catch(e) {
        throw new error.castError(e);
    }
}