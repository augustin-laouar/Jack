export async function store(jsonValue) {
    await browser.storage.local.set(jsonValue);
}

export async function read(key) {
    const data = await browser.storage.local.get(key);
    if(data && key in data) {
        return data[key];
    }
    return null;
} 


export async function remove(key) {
    browser.storage.local.remove(key);
}