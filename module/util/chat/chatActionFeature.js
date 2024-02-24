import {handleChatAction} from "./SplittermondChatCard.js";

export function chatActionFeature(){
    Hooks.on("renderChatLog", (_app, html, _data) => chatListeners(html));
    Hooks.on("renderChatPopout", (_app, html, _data) => chatListeners(html));

    Hooks.once("init", () => {
        game.socket.on("system.splittermond", (data) => {

            if (data.type === "chatAction") {
                if (!game.user.isGM) return false;
                const connectedGMs = game.users.filter((u) => u.isGM && u.active);
                const isResponsibleGM = !connectedGMs.some((other) => other.id < game.user.id);
                if (!isResponsibleGM) return;

                const {action, messageId, userId} = data;
                handleChatAction(action, messageId, rollIndex, userId);
            }
        });
    });
}

/**
 * @param {JQuery} html
 */
function chatListeners(html) {
    html.on("click", ".splittermond-chat-action[data-action]", onChatCardAction);
}

async function onChatCardAction(event) {
    event.preventDefault();

    const button = event.currentTarget;
    const action = button.dataset.action;
    const messageId = button.closest(".message").dataset.messageId;

    if (!game.user.isGM) {
        if (!game.users.filter((u) => u.isGM && u.active).length) {
            return ui.notifications.warn(game.i18n.localize("FAx.ChatCard.NoGMConnected"));
        }

        return game.socket.emit("system.splittermond", {
            type: "chatAction",
            action,
            messageId,
            userId: game.user.id,
        });
    }

    return await handleChatAction(action, messageId);
}