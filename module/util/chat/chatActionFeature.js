import {handleChatAction, handleLocalChatAction} from "./SplittermondChatCard.js";
import {foundryApi} from "../../api/foundryApi.js";

const socketEvent = "system.splittermond";
export function chatActionFeature(){
    foundryApi.hooks.on("renderChatLog", (_app, html, _data) => chatListeners(html));
    foundryApi.hooks.on("renderChatPopout", (_app, html, _data) => chatListeners(html));

    foundryApi.hooks.once("init", () => {
        game.socket.on(socketEvent, (data) => {

            if (data.type === "chatAction") {
                if (!foundryApi.currentUser.isGM) {
                    return Promise.resolve();
                }
                const connectedGMs = foundryApi.users.filter((u) => u.isGM && u.active);
                const isResponsibleGM = !connectedGMs.some((other) => other.id < foundryApi.currentUser.id);
                if (!isResponsibleGM){
                    return Promise.resolve();
                }

                const {action, messageId, userId} = data;
                return handleChatAction(action, messageId, userId);
            }
            return Promise.resolve();
        });
    });
}

/**
 * @param {JQuery} html
 */
function chatListeners(html) {
    html.on("click", ".splittermond-chat-action[data-action]", onChatCardAction);
    html.on("click", ".splittermond-chat-action[data-localAction]", onLocalChatCardAction)
}

async function onChatCardAction(event) {
    event.preventDefault();

    const button = event.currentTarget;
    const action = button.dataset.action;
    const messageId = button.closest(".message").dataset.messageId;

    if (!foundryApi.currentUser.isGM) {
        if (!game.users.filter((u) => u.isGM && u.active).length) {
            return foundryApi.warnUser("splittermond.chatCard.noGMConnected");
        }

        return foundryApi.socket.emit(socketEvent, {
            type: "chatAction",
            action,
            messageId,
            userId: game.user.id,
        });
    }

    return await handleChatAction(action, messageId);
}

function onLocalChatCardAction(event){
    const button = event.currentTarget;
    const action = button.dataset.localaction;
    const messageId = button.closest(".message").dataset.messageId;
    return handleLocalChatAction(action, messageId);
}