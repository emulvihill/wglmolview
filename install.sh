#!/bin/bash

pushd .

rm -rf ./target
mkdir ./target

cd ./www/src/molview
find . \( -name "*.src" -or -name "*.src.map" \) -type f|xargs rm -f

popd
pushd .

cd ./www/src
rm -f Main.src Main.src.map
tsc --sourcemap --target ES5 Main.ts

popd

cp -r ./www/* ./target
rm -rf ./target/ts

echo ""
echo ""
echo "place ./target directory into your web server's content area"

