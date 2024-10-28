# WebGL MolView
Written and maintained by Eric Mulvihill (eric.mulvihill@gmail.com)

## What it is?
It is an open source _ECMAScript 5 + WebGL compatible PDB viewer_. Just insert into your web page, point it to a PDB file and it will display it in glorious 3 dimensions.

+ written in _Typescript_ 2.X and utilizes the wonderful _three.js_ 3D support library written by MrDoob.

+ supports interactions such as:
    + zooming/rotating
    + Selecting atoms for identification
    + Selecting multiple atoms for calculating distance, bond angle or torsion angle.

+ Licensed under Apache license which was chosen for friendliness to most personal and commercial applications. (giving back improvements is always appreciated though)

### What it isn't:
+ A full organic PDB molecule viewer. No support for sheets, residues, substructures and all that other advanced chemistry stuff I don't even know anything about.
+ Compatible with browsers that don't support WebGL (Internet Explorer and old versions of Safari & Firefox)

### What it could be with your help:
+ A more-full featured viewer. More color modes, possibly supporting some protein structures, maybe PDB animations?
+ A better tool for e-learning. I'd like to add support for querying the state of selections, for entering answers in web quizzes.

## How to use it
+ Prerequisites: NPM 10.8.0 or greater
+ Clone the Git project to a local directory
+ Build and run as follows:
    * `cd` into project root
    * `npm install`
    * `npm run build`
    * `npm run server`
    * View at: `http://localhost:8080` (change the port in `.env` if needed!)
+ Run unit tests using: `npm run test`

# What's included
+ /spec - tests
+ /src/src/main.ts - stub code to get a web page to display a molecule. Your application would replicate this stub code in some way.
+ /src/src/molview - All WGLMolView source
+ /src/three/OrbitControls - A more advanced mouse navigation for spinning the molecules
+ /src/ts - Third party Typescript annotations needed for strong typing the third party libraries
+ /src/pdb - example PDB files
+ /www - front end content to be displayed in browser

### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone https://ericmulvihill@bitbucket.org/ericmulvihill/wglmolview.git`
- Navigate: `cd wglmolview`
- Install dependencies: `npm ci`

#### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `npm run dev`
- Building: `npm run build`
- Production Mode: Set `.env` to `NODE_ENV="production"` then `npm run build && npm run start`

🎉 Happy coding!
