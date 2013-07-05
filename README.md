# WebGL MolView

## What it is?
It is an open source _Ecmascript5 + WebGL compatible PDB viewer_. Just insert into your web page, point it to a PDB file and it will display it in glorious 3 dimensions.

+ written in _Typescript_ (0.83 preview) and utilizes the wonderful _three.js_ 3D support library written by MrDoob.

+ supports interactions such as:
- zooming/rotating
- Selecting atoms for identification
- Selecting multiple atoms for calculating distance, bond angle or torsion angle.

+ Licensed under Apache license which was chosen for friendliness to most personal and commercial applications. (giving back improvements is always appreciated though)

### What it isn't:
+ A full organic PDB molecule viewer. No support for sheets, residues, substructures and all that other advanced chemistry stuff I don't even know anything about.
+ Compatible with browsers that don't support WebGL (Internet Explorer 10 and below, and old versions of Safari & Firefox)

### What it could be with your help:
+ A more-full featured viewer. More color modes, possibly supporting some proetin structures, maybe PDB animations?
+ A better tool for e-learning. I'd like to add support for querying the state of selections, for entering answers in web quizzes.

## How to use it
+ Install Node.js, and then install Typescript 0.83 (the version is important.. 0.9 will not currently work due to changes in the evolving language spec)
+ Run the _install.sh_ Bash script, which can be run from the root folder of the project. For Windows, I'd suggest running this via Cygwin or Git Bash.
+ The ./target folder will then contain the stuff needed to view some molecules. Drop it into a web server and take a look.


# What's included
/src/js/Main.ts - stub code to get a web page to display a molecule. Your application would replicate this stub code in some way.
/src/js/molview - All WGLMolView source
/src/js/vendor - required third party libraries (currently three.js, jquery, and modernizr) Modernizr is mainly used for making the sample page look nicer.
/src/ts - Third party Typescript annotations needed for strong typing the third party libraries
/src/pdb - example PDB files

