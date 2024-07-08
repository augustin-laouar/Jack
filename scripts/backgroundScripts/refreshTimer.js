import * as tools from '../login_tools.js';

browser.runtime.onMessage.addListener(notify);

function notify(message) {
    if(message.type === 'pageClick') {
        tools.storeLastLogin();
    }
}