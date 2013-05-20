var console;
function init() {
    makeLog();
    var mv = new molview.MolView({
        domElement: "container",
        pdbUrl: "/pdb/helix2.pdb"
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
