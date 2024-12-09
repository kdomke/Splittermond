


const chatMessageRegistry = new Map();

/**
 *
 * @param {string}key
 * @param {constructor} constructor
 */
export function addToRegistry(key, constructor){
    chatMessageRegistry.set(key, constructor);
}

export function getFromRegistry(key){
    return chatMessageRegistry.get(key);
}