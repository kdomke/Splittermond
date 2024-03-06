export const utilGameApi = new class UtilGameApi {

    /**
     * @typedef Die
     * @type {object}
     * @property {number} faces
     * @property {{active:true, result:number}[]} results
     */

    /**
     * @typedef OperatorTerm
     * @type {object}
     * @property {string} operator
     */

    /**
     * @typedef NumericTerm
     * @type {object}
     * @property {number} number
     */


    /**
     * @typedef Roll
     * @type {object}
     * @property {((options:{async: true})=>Promise<Roll>)}
     * @property {number} _total
     * @property {Readonly<number>} total
     * @property {(Die|OperatorTerm|NumericTerm)[]}terms
     */
    /**
     * @param {string} damageFormula
     * @param {object} context
     * @return {Roll}
     */
    roll(damageFormula, context = {}) {
        return new Roll(damageFormula, context)
    }
}