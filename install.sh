#!/bin/bash

pushd .

rm -rf ./target
mkdir ./target

cd ./src/js/molview
find . \( -name "*.js" -or -name "*.js.map" \) -type f|xargs rm -f

popd
pushd .

cd ./src/js
rm -f Main.js Main.js.map
tsc --sourcemap --target ES5 Main.ts

popd

cp -r ./src/* ./target
rm -rf ./target/ts

echo ""
echo ""
echo "place ./target directory into your web server's content area"

