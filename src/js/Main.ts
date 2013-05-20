/// <reference path="../ts/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../ts/DefinitelyTyped/threejs/three.d.ts" />

/// <reference path="molview/MolView.ts" />

var console;

function init() {
    // launch point from html page
    makeLog();

    var mv:molview.MolView = new molview.MolView({domElement:"container", pdbUrl:"/pdb/arg.pdb"});


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

