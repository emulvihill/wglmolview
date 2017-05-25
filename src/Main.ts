import {Constants} from "./molview/Constants";
import {MolView} from "./molview/MolView";

function init() {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    const mv: MolView = new MolView({
        pdbUrl: "pdb/aa/ala.pdb"
    });

    function getElement(s: string): HTMLElement {
        return document.getElementById(s)! || console.log("HtmlElement " + s + " not found");
    }

    getElement("#renderStick").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_STICKS);
    };
    getElement("#renderBall").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
    };
    getElement("#renderBlob").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
    };

    getElement("#selectionInfo").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_IDENTIFY);
    };
    getElement("#selectionDistance").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_DISTANCE);
    };
    getElement("#selectionRotation").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_ROTATION);
    };
    getElement("#selectionTorsion").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_TORSION);
    };

    // molecule selection dropdown
    getElement("#pdbSelect").onchange = () => {
        const value = (getElement("#pdbSelect") as HTMLSelectElement).value;
        mv.loadPDB(value);
    };
}

init();
