var console;
function init() {
    makeLog();
    var mv = new molview.MolView({
        pdbUrl: "/pdb/bsheet.pdb"
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
