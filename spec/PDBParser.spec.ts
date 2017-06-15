import {Molecule} from "../src/molview/model/Molecule";
import {PDBParser} from "../src/molview/PDBParser";

describe("PDBParser", () => {

    let pdbData: string;

    beforeAll((done) => {
        fetch("base/spec/elementData/ala.pdb")
            .then(
                (response: Response) => {
                    response.text()
                        .then((data) => {
                            pdbData = data;
                            done();
                        });
                });
    });

    it("creates parser", () => {
        const parser = new PDBParser();
        expect(parser).toBeTruthy();
    });

    it("parses bsheet.pdb", () => {
        const mol: Molecule = PDBParser.parsePDB(pdbData);
        expect(mol).toBeTruthy();
        expect(mol.numAtoms).toEqual(13);
        expect(mol.numBonds).toEqual(13);
    });
});
