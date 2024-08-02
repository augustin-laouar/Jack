let derivedKey = null;
let isLogged = false;
let lastAction = null;

export function getIsLogged() {
    return isLogged;
}

export function setIsLogged(value) {
    isLogged = value;
}

export function getLastAction() {
    return lastAction;
}

export function setLastAction(value) {
    lastAction = value;
}

export function getDerivedKey() {
    return derivedKey;
}

export function setDerivedKey(value) {
    derivedKey = value;
}