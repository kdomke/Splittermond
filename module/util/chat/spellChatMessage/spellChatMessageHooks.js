/**
 * @typedef {{
 *     "message": {
 *         "_id": string,
 *         "type": number,
 *         "user": string,
 *         "timestamp": number,
 *         "flavor": string,
 *         "content": "<h3 class=\"nue\">Getting Started</h3>\n      <p class=\"nue\">It looks like this is a new World. To get started, you should first add any additional players you might need via the <a class=\"nue-tab\" data-tab=\"settings\">User Management</a> configuration. From there, you can create <a class=\"nue-tab\" data-tab=\"actors\">Actors</a> for them, as well as any other important personas you need to represent. Maps and other visuals can be set up using <a class=\"nue-tab\" data-tab=\"scenes\">Scenes</a>, and handouts, notes, and other information can be stored in <a class=\"nue-tab\" data-tab=\"journal\">Journal Entries</a>.</p>\n      <p class=\"nue\">Be sure to investigate all of the tabs available in this sidebar, and for more in-depth information, you can review the <a href=\"https://foundryvtt.com/article/tutorial/\" target=\"_blank\">Gamemaster Tutorial</a> series in our <a href=\"https://foundryvtt.com/kb/\" target=\"_blank\">Knowledge Base</a>.</p>\n      <footer class=\"nue\"><i class=\"fas fa-info-circle\"></i> This chat card can be popped out by right-clicking it, or you can pop out the entire chat tab by right-clicking the speech bubble icon at the top. You can do the same thing to popout any of the other sidebar tabs as well.</footer>",
 *         "speaker": {
 *             "scene": null,
 *             "actor": null,
 *             "token": null,
 *             "alias": "Foundry Virtual Tabletop"
 *         },
 *         "whisper": [
 *            number
 *         ],
 *         "blind": boolean,
 *         "rolls": [],
 *         "emote": boolean,
 *         "flags": {
 *             "core": {
 *                 "nue": boolean,
 *                 "canPopout": boolean
 *             }
 *         }
 *     },
 *     "user": {
 *         "name": string,
 *         "role": number,
 *         "_id": string,
 *         "character": null,
 *         "color": "#cc5b28",
 *         "pronouns": "",
 *         "hotbar": {
 *             "1": string
 *         },
 *         "permissions": {},
 *         "flags": {},
 *         "_stats": {
 *             "systemId": null,
 *             "systemVersion": null,
 *             "coreVersion": null,
 *             "createdTime": null,
 *             "modifiedTime": null,
 *             "lastModifiedBy": null
 *         },
 *         "password": ""
 *     },
 *     "author": {
 *         "name": string,
 *         "role": 4,
 *         "_id": string,
 *         "character": null,
 *         "color": "#cc5b28",
 *         "pronouns": "",
 *         "hotbar": {
 *             "1": "QxhZr3p2Xbc0snvk"
 *         },
 *         "permissions": {},
 *         "flags": {},
 *         "_stats": {
 *             "systemId": null,
 *             "systemVersion": null,
 *             "coreVersion": null,
 *             "createdTime": null,
 *             "modifiedTime": null,
 *             "lastModifiedBy": null
 *         },
 *         "password": ""
 *     },
 *     "alias": "Foundry Virtual Tabletop",
 *     "cssClass": "whisper",
 *     "isWhisper": 1,
 *     "canDelete": true,
 *     "whisperTo": string
 * }} ChatMessageData
 */
/**
 * This file contains the hooks for the chat message rendering.
 * @param app
 * @param {JQuery} html
 * @param {ChatMessageData} data
 */
export function addSpellChatEventHooks(app, html, data){

}