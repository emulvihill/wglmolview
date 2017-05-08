function init() {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    var mv: molview.MolView = new molview.MolView({
        baseUrl: "/target",
        pdbUrl: "pdb/helix2.pdb",
        domElement: "container",
        infoElement: "infoText"
    });

    function getElement(s: string): HTMLElement {
        return document.getElementById(s);
    }

    getElement("#renderStick").click = () => {
        mv.setRenderMode(molview.Constants.RENDERMODE_STICKS)
    };
    getElement("#renderBall").click = () => {
        mv.setRenderMode(molview.Constants.RENDERMODE_BALL_AND_STICK)
    };
    getElement("#renderBlob").click = () => {
        mv.setRenderMode(molview.Constants.RENDERMODE_SPACE_FILL)
    };

    getElement("#selectionInfo").click = () => {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_IDENTIFY)
    };
    getElement("#selectionDistance").click = () => {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_DISTANCE)
    };
    getElement("#selectionRotation").click = () => {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_ROTATION)
    };
    getElement("#selectionTorsion").click = () => {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_TORSION)
    };

    // molecule selection dropdown
    getElement("#pdbSelect").onchange = (event) => {
        let value = (<HTMLSelectElement> getElement("#pdbSelect")).value;
        mv.loadPDB(value);
    };
}