/// <reference path="../typings/tsd.d.ts" />

function init() {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    var mv:molview.MolView = new molview.MolView({baseUrl:"/target", pdbUrl:"pdb/helix2.pdb", domElement:"container", infoElement:"infoText"});

    $("#renderStick").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_STICKS)});
    $("#renderBall").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_BALL_AND_STICK)});
    $("#renderBlob").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_SPACE_FILL)});

    $("#selectionInfo").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_IDENTIFY)});
    $("#selectionDistance").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_DISTANCE)});
    $("#selectionRotation").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_ROTATION)});
    $("#selectionTorsion").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_TORSION)});

    // molecule selection dropdown
    $("#pdbSelect").change(()=> {
        mv.loadPDB($("#pdbSelect").val());
    });
}

