import { setIsLogged, setDerivedKey, setLastAction } from '../vars.js';



export async function logout() {
    setIsLogged(false);
    setDerivedKey(null);
    setLastAction(null);
}

export async function handle() {
    await logout();
    return true;
}


