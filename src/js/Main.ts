/// <reference path="../ts/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../ts/DefinitelyTyped/threejs/three.d.ts" />

/// <reference path="../ts/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="molview/MolView.ts" />

var console;

function init() {
    // launch point from html page
    makeLog();

    var mv:molview.MolView = new molview.MolView({domElement:"container", infoElement:"infoText", pdbUrl:"/pdb/helix2.pdb"});

    $("#renderStick").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_STICKS)});
    $("#renderBall").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_BALL_AND_STICK)});
    $("#renderBlob").click(()=>{mv.setRenderMode(molview.Constants.RENDERMODE_SPACE_FILL)});

    $("#selectionInfo").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_IDENTIFY)});
    $("#selectionDistance").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_DISTANCE)});
    $("#selectionRotation").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_ROTATION)});
    $("#selectionTorsion").click(()=>{mv.setSelectionMode(molview.Constants.SELECTIONMODE_TORSION)});

}

function makeLog() {
    if (!window.console) console = {};
    console.log = console.log || function () {
    };
    console.warn = console.warn || function () {
    };
    console.error = console.error || function () {
    };
    console.info = console.info || function () {
    };
}

