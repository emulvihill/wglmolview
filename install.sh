#!/bin/bash

pushd .

rm -rf ./target
mkdir ./target

cd ./www/js/molview
find . \( -name "*.js" -or -name "*.js.map" \) -type f|xargs rm -f

popd
pushd .

cd ./www/js
rm -f Main.js Main.js.map
tsc --sourcemap --target ES5 Main.ts

popd

cp -r ./www/* ./target
rm -rf ./target/ts

echo ""
echo ""
echo "place ./target directory into your web server's content area"

