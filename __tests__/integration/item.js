export function itemTest(context) {
    const {describe, it, expect} = context;
    describe("foundry API compatibility", () => {
        it("has an actor attached if on an actor",()=>{
            const actorWithItem = game.actors.filter(actor => actor.items.size > 0)
            if(actorWithItem.length === 0) {
                this.skip();
            }
            const actor = actorWithItem[0];
            const underTest = actor.items.find(item => true) //get first item

            expect(underTest.actor).to.equal(actor);
        });
    });
};