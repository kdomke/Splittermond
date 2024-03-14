import {handleChatAction, handleLocalChatAction} from "./SplittermondChatCard.js";
import {chatFeatureApi} from "./chatActionGameApi.js";

const socketEvent = "system.splittermond";
export function chatActionFeature(){
    chatFeatureApi.hooks.on("renderChatLog", (_app, html, _data) => chatListeners(html));
    chatFeatureApi.hooks.on("renderChatPopout", (_app, html, _data) => chatListeners(html));

    chatFeatureApi.hooks.once("init", () => {
        game.socket.on(socketEvent, (data) => {

            if (data.type === "chatAction") {
                if (!chatFeatureApi.currentUser.isGM) {
                    return Promise.resolve();
                }
                const connectedGMs = chatFeatureApi.users.filter((u) => u.isGM && u.active);
                const isResponsibleGM = !connectedGMs.some((other) => other.id < chatFeatureApi.currentUser.id);
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

    if (!chatFeatureApi.currentUser.isGM) {
        if (!game.users.filter((u) => u.isGM && u.active).length) {
            return chatFeatureApi.warnUser("splittermond.chatCard.noGMConnected");
        }

        return chatFeatureApi.socket.emit(socketEvent, {
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