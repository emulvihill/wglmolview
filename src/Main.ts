import {MolView} from "./molview/MolView";
import {Constants} from "./molview/Constants";
function init() {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    let mv: MolView = new MolView({
        baseUrl: "/target",
        pdbUrl: "pdb/helix2.pdb",
        domElement: "container",
        infoElement: "infoText"
    });

    function getElement(s: string): HTMLElement {
        return document.getElementById(s)! || console.log("HtmlElement " + s + " not found");
    }

    getElement("#renderStick").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_STICKS)
    };
    getElement("#renderBall").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK)
    };
    getElement("#renderBlob").click = () => {
        mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL)
    };

    getElement("#selectionInfo").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_IDENTIFY)
    };
    getElement("#selectionDistance").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_DISTANCE)
    };
    getElement("#selectionRotation").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_ROTATION)
    };
    getElement("#selectionTorsion").click = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_TORSION)
    };

    // molecule selection dropdown
    getElement("#pdbSelect").onchange = () => {
        let value = (<HTMLSelectElement> getElement("#pdbSelect")).value;
        mv.loadPDB(value);
    };
}