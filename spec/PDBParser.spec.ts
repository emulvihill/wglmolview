import {Molecule} from "../src/molview/model/Molecule";
import {PDBParser} from "../src/molview/PDBParser";

describe("PDBParser", () => {

    let pdbData: string;

    beforeAll(done => {
        // need dom elements to exist
        document.createElement("wglContent");
        document.createElement("wglInfo");
        (window as any).molview_config =  {
            pdbUrl: "base/spec/data/ala.pdb",
            domElement: "wglContent",
            infoElement: "wglInfo"
        };

        fetch("base/spec/data/ala.pdb")
            .then(
                (response: Response) => {
                    response.text()
                        .then((data) => {
                            pdbData = data;
                            console.log(pdbData);
                            done();
                        });
                });
    }, 10000);

    it("creates parser", () => {
        const parser = new PDBParser();
        expect(parser).toBeTruthy();
    });

    it("parses ala.pdb", () => {
        const mol: Molecule = PDBParser.parsePDB(pdbData);
        expect(mol).toBeTruthy();
        expect(mol.numAtoms).toEqual(13);
        expect(mol.numBonds).toEqual(13);
    });
});
