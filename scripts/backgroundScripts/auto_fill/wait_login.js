import { isLogged } from "../../login_tools.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


export async function checkLogin() {
    const res = await isLogged();
    return res;
}

export async function waitLogin() {
    while (!await isLogged()) {
        console.log("running");
        await sleep(50);
    }
    return true;
}