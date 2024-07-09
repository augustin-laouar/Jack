import {logout} from '../login_tools.js';

browser.runtime.onSuspend.addListener(async () => {
    await logout();
});