import {Constants} from "./molview/Constants";
import {MolView} from "./molview/MolView";
import {Utility} from "./molview/Utility";

document.onload = function onLoad(event: Event) {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    let mv: MolView = new MolView({
        pdbUrl: "pdb/aa/ala.pdb"
    });

    Utility.getElement("#renderStick").onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_STICKS);
    };

    Utility.getElement("#renderBall").onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
    };

    Utility.getElement("#renderBlob").onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
    };

    Utility.getElement("#selectionInfo").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_IDENTIFY);
    };

    Utility.getElement("#selectionDistance").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_DISTANCE);
    };

    Utility.getElement("#selectionRotation").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_ROTATION);
    };

    Utility.getElement("#selectionTorsion").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_TORSION);
    };

    // molecule selection dropdown
    const selectElem = Utility.getElement("#pdbSelect") as HTMLSelectElement;
    selectElem.onchange = () => {
        mv.loadPDB(selectElem.value);
    };
};
