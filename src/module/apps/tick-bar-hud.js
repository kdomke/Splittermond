import * as Chat from "../util/chat.js";

export default class TickBarHud extends Application {
    constructor(options) {
        super(options);
        game.combats.apps.push(this);

        /**
         * Record the currently tracked Combat encounter
         * @type {Combat|null}
         */
        this.viewed = null;
        this.viewedTick = null;
        this.currentTick = null;
        this.lastStatusTick = null;
        this.maxTick = null;
        this.minTick = null;
        this._dragOverTimeout = 0;
        this.render(true);
    }

    get combats() {
        const currentScene = game.scenes.current || null;
        return game.combats.filter(c => (c.scene === null) || (c.scene === currentScene));
    }

    _onDragStart(event) {
        var element = $(event.currentTarget);
        if(element.closestData("is-status") == true)
        {            
            event.dataTransfer.effectAllowed = "none";
            return;
        }

        event.dataTransfer.effectAllowed = "move"
        let combatantId = element.closestData('combatant-id');
        event.dataTransfer.setData("text/plain", JSON.stringify({
            type: "Combatant",
            combatantId: combatantId,
        }));
        console.log(event)
    }

    _onDrop(event) {
        console.log(event);
        if (!this.viewed) return;
        let tick = $(event.currentTarget).closestData('tick');
        let data = JSON.parse(event.dataTransfer.getData("text/plain"));

        if (tick != undefined && data.type=="Combatant") {
            let combatant = this.viewed.combatants.get(data.combatantId);
            if (combatant && combatant.isOwner) {
                if (combatant.initiative === 20000) {
                    this.viewed.setInitiative(data.combatantId, tick, true);
                } else {
                    this.viewed.setInitiative(data.combatantId, tick);
                }
                
            }
            
        }
    }

    _onDragOver(event) {
        //console.log(event)
        let targetElement = $(event.currentTarget);
        let action = targetElement.closestData("action");
        let now = Date.now();
        if (action && now - this._dragOverTimeout > 300) {
            this._dragOverTimeout = now;
            let parentElement = targetElement.parent();
            let inView = parentElement.find(".tick-bar-hud-ticks").width()/72;
            let step = 1;

            if (action == "next-ticks") {
                this.viewedTick = this.viewedTick + step;
            }

            if (action == "previous-ticks") {
                this.viewedTick = this.viewedTick - step;
            }

            if (this.viewedTick < this.currentTick) {
                this.viewedTick = this.currentTick;
            }

            if (this.viewedTick+Math.floor(inView)> this.maxTick) {
                this.viewedTick = this.maxTick - Math.floor(inView)+1;
            }

            let offset = (this.viewedTick - this.currentTick)*72;

            parentElement.find(".tick-bar-hud-ticks-scroll").animate({left: -offset+"px"},200);

            if (this.currentTick === this.viewedTick) {
                if (parentElement.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']").css('opacity') == 1) {
                    parentElement.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']").animate({width: "0px", "margin-left": "-10px", opacity: 0},100);
                }
            } else {
                if (parentElement.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']").css('opacity') == 0) {
                    parentElement.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']").animate({width: "32px", "margin-left": "10px", opacity: 1},100);
                }
                
            }

        } 

        //console.log(new Date())
    }

    _canDragStart(selector) {
        return true;
    }

    _canDragDrop(selector) {
        return true;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "tick-bar-hud";
        options.template = "systems/splittermond/templates/apps/tick-bar-hud.hbs";
        options.popOut = false;
        options.dragDrop= [{dragSelector: ".tick-bar-hud-combatant-list-item", dropSelector: [".tick-bar-hud-tick", ".tick-bar-hud-nav-btn"]}]
        return options;
    }

    async getData(options) {
        let data = {
            ticks: [],
            wait: [],
            keepReady: []
        }

        const combats = this.combats;
        let temp = combats.length ? combats.find(c => c.isActive) || combats[0] : null;
        if (temp != this.viewed) {
            this.viewedTick = null;
        }

        if (this.viewedTick != this.viewedTick) {
            this.viewedTick = null;
        }
        
        this.viewed = temp;
        if (this.viewed && this.viewed.started) {
            const combat = this.viewed;
            let wasOnCurrentTick = this.currentTick == this.viewedTick;

            this.currentTick = Math.round(combat.turns[combat.turn]?.initiative);

            if (this.currentTick != this.currentTick) {
                this.currentTick = null;
            }

            this.viewedTick = this.viewedTick ?? this.currentTick;

            if (this.viewedTick < this.currentTick || wasOnCurrentTick) {
                this.viewedTick = this.currentTick
            }

            var virtualTokens = combat.combatants.contents.map(e => {
                return {
                    combatant: e,
                    virtualTokens: e.actor.getVirtualStatusTokens() || [],                    
                }
            });

            var iniData = combat.turns
                .filter(e => (e.initiative != null & !e.isDefeated))
                .map(e => Math.round(e.initiative))
                .filter(e => e < 9999);
            var maxStatusEffectTick = Math.max(...virtualTokens.map(e => {
                var ticks = e.virtualTokens.map(f => {
                    return (f.times * f.interval) + f.startTick;
                });
                return Math.max(...ticks)
            }));

            var lastTick = this.minTick;
            this.maxTick = Math.max(Math.max(...iniData, maxStatusEffectTick) + 25, 50);
            this.minTick = Math.min(...iniData);
            for (let tickNumber = this.minTick; tickNumber <= this.maxTick; tickNumber++) {
                data.ticks.push({
                    tickNumber: tickNumber,
                    isCurrentTick: this.currentTick == tickNumber,
                    combatants: [],
                    statusEffects: []
                });                         
            }

            for ( let [i, c] of combat.turns.entries() ) {

                

                if (c.initiative == null) continue;

                if ( c.initiative > 9999) {

                    let combatantData = {
                        id: c.id,
                        name: c.name,
                        img: c.img,
                        active: false,
                        owner: c.isOwner,
                        defeated: c.isDefeated,
                        hidden: c.hidden,
                        initiative: c.initiative,
                        hasRolled: c.initiative !== null
                    };
                    
                    if (c.initiative === 10000) {
                        data.wait.push(combatantData);
                    }

                    if (c.initiative === 20000) {
                        data.keepReady.push(combatantData);
                    }
                    
                    continue;
                };

                if ( !c.visible || c.isDefeated) continue;  
                
                data.ticks.find(t => t.tickNumber == Math.round(c.initiative)).combatants.push({
                    id: c.id,
                    name: c.name,
                    img: c.img,
                    active: i === combat.turn,
                    owner: c.isOwner,
                    defeated: c.isDefeated,
                    hidden: c.hidden,
                    initiative: c.initiative,
                    hasRolled: c.initiative !== null
                });                
            }   
            
            var activatedStatusTokens = [];

            virtualTokens.forEach(vToken => {                
                vToken.virtualTokens.forEach(element => {  
                    for (let index = 0; index < element.times; index++) {
                        const onTick = (index * element.interval) + element.startTick;
                        if(onTick <= this.minTick)
                        {
                            if(this.lastStatusTick != null && 
                                lastTick <= onTick && 
                                this.lastStatusTick != this.currentTick &&
                                this.lastStatusTick != onTick &&
                                vToken.combatant.isOwner)
                            {
                                //this effect was activated in between the last tick and the current tick or we just got to that tick
                                activatedStatusTokens.push({
                                    onTick,
                                    virtualToken: element,
                                    combatant: vToken.combatant,
                                    activationNo: index + 1,
                                    ownerId: vToken.combatant.id,
                                    statusId: vToken.statusId
                                })
                            }
                            if(onTick < this.minTick)
                            {
                                continue;
                            }                            
                        }
                        data.ticks.find(t => t.tickNumber == onTick).statusEffects.push({
                            id: vToken.combatant.id,
                            owner: vToken.combatant.owner,
                            active: false,
                            img: element.img || vToken.combatant.img,
                            description: element.description,
                            name: `${vToken.combatant.name} - ${element.name} ${element.level} #${index}`
                        });
                    }
                });
            });
            for (let index = 0; index < activatedStatusTokens.length; index++) {
                const element = activatedStatusTokens[index];
                ChatMessage.create(await Chat.prepareStatusEffectMessage(element.combatant.actor, element));
            }
        }

        this.lastStatusTick = this.currentTick;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $(html.find('.tick-bar-hud-combatant-list')).each(function () {
            let zIndexCounter = $(this).children().length - 1;

            $(this).children().each(function () {
                $(this).css({"z-index":zIndexCounter});
                zIndexCounter--;
            });

            $(this).hover(function () {
                $(this).children(":not(:first-child)").animate({"margin-top": "5px"},200);
            },function () {
                $(this).children(":not(:first-child)").animate({"margin-top": "-38px"},200);
            })
        });

        html.find('.tick-bar-hud-nav-btn').click(event => {
            let action = $(event.currentTarget).closestData("action");
            let inView = $(html.find(".tick-bar-hud-ticks")).width()/72;
            let step = Math.ceil(inView/2);

            if (action == "next-ticks") {
                this.viewedTick = this.viewedTick + step;
            }

            if (action == "previous-ticks") {
                this.viewedTick = this.viewedTick - step;
            }

            if (this.viewedTick < this.currentTick) {
                this.viewedTick = this.currentTick;
            }

            if (this.viewedTick+Math.floor(inView)> this.maxTick) {
                this.viewedTick = this.maxTick - Math.floor(inView)+1;
            }

            let offset = (this.viewedTick - this.currentTick)*72;

            $(html.find(".tick-bar-hud-ticks-scroll")).animate({left: -offset+"px"},200, () => {
                
            });

            if (this.currentTick === this.viewedTick) {
                if ($(html.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']")).css('opacity') == 1) {
                    $(html.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']")).animate({width: "0px", "margin-left": "-10px", opacity: 0},100);
                }
            } else {
                if ($(html.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']")).css('opacity') == 0) {
                    $(html.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']")).animate({width: "32px", "margin-left": "10px", opacity: 1},100);
                }
            }

            
        })

        let offset = (this.viewedTick - this.currentTick)*72;

        $(html.find(".tick-bar-hud-ticks:not(.tick-bar-hud-ticks-special)")).children().css({left: -offset+"px"});

        html.find(".tick-bar-hud-combatant-list-item").hover(event => {
            const combatant = this.viewed.combatants.get(event.currentTarget.dataset.combatantId);
            const token = combatant.token?.object;
            if ( !token._controlled ) token._onHoverIn(event);
        }, event => {
            const combatant = this.viewed.combatants.get(event.currentTarget.dataset.combatantId);
            const token = combatant.token?.object;
            token._onHoverOut(event);
        });

        html.find(".tick-bar-hud-combatant-list-item").click(event => {
            const combatant = this.viewed.combatants.get(event.currentTarget.dataset.combatantId);
            const token = combatant.token;
            if ( (token === null) || !combatant.actor?.testUserPermission(game.user, "OBSERVED") ) return;
            const now = Date.now();
        
            // Handle double-left click to open sheet
            const dt = now - this._clickTime;
            this._clickTime = now;
            if ( dt <= 250 ) return token?.actor?.sheet.render(true);
        
            // If the Token does not exist in this scene
            // TODO: This is a temporary workaround until we persist sceneId as part of the Combatant data model
            if ( token === undefined ) {
              return ui.notifications.warn(game.i18n.format("COMBAT.CombatantNotInScene", {name: combatant.name}));
            }
        
            // Control and pan to Token object
            if ( token.object ) {
              token.object?.control({releaseOthers: true});
              return canvas.animatePan({x: token.x, y: token.y});
            }

        })

        $(html.find(".tick-bar-hud-combatant-list-item")).on("dragstart", event => {
            $(html.find(".tick-bar-hud-tick-special-no-data")).animate({width: "128px", opacity: 1},200)
        }).on("dragend", event => {
            $(html.find(".tick-bar-hud-tick-special-no-data")).animate({width: "0px", opacity: 0},200)
        })

        if (this.currentTick === this.viewedTick) {
            $(html.find(".tick-bar-hud-nav-btn[data-action='previous-ticks']")).css({width: "0px", "margin-left": "-10px", opacity: 0});
        }

    }

    
  
}