var console;
function init() {
    makeLog();
    var mv = new molview.MolView({
        domElement: "container",
        infoElement: "infoText",
        pdbUrl: "/pdb/helix2.pdb"
    });
    $("#renderStick").click(function () {
        mv.setRenderMode(molview.Constants.RENDERMODE_STICKS);
    });
    $("#renderBall").click(function () {
        mv.setRenderMode(molview.Constants.RENDERMODE_BALL_AND_STICK);
    });
    $("#renderBlob").click(function () {
        mv.setRenderMode(molview.Constants.RENDERMODE_SPACE_FILL);
    });
    $("#selectionInfo").click(function () {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_IDENTIFY);
    });
    $("#selectionDistance").click(function () {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_DISTANCE);
    });
    $("#selectionRotation").click(function () {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_ROTATION);
    });
    $("#selectionTorsion").click(function () {
        mv.setSelectionMode(molview.Constants.SELECTIONMODE_TORSION);
    });
    $("#pdbSelect").change(function () {
        mv.loadPDB($("#pdbSelect").val());
    });
}
function makeLog() {
    if(!window.console) {
        console = {
        };
    }
    console.log = console.log || function () {
    };
    console.warn = console.warn || function () {
    };
    console.error = console.error || function () {
    };
    console.info = console.info || function () {
    };
}
//@ sourceMappingURL=Main.js.map
