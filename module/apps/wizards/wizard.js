export default class SplittermondWizard extends Application {
    constructor(app) {
        super(app)

    }

    getData() {
        const data = super.getData();
        data.ready = false;

        return data;
    }

    activateListeners(html) {


        html.find('button[name="save"]').click(this._onSave.bind(this));
        html.find('button[name="cancel"]').click(this._onCancel.bind(this));
    }

    _onSave(event) {
        this.close();
    }

    _onCancel(event) {
        this.close();
    }



}