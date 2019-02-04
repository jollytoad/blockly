#!/usr/bin/env bash

# Generate Typescript d.ts file for Blockly
#
# Requires you to checkout clutz & closure-compiler alongside this blockly repo
#
# git clone https://github.com/google/closure-compiler.git
# git clone https://github.com/angular/clutz.git
#
# You also need to build the clutz tool, see: https://github.com/angular/clutz
#
# Usage:
#
#    ./typescript_def_build.sh
#
# The only output is a blockly.d.ts file

../../clutz/build/install/clutz/bin/clutz \
  ../core/*.js \
  ../core/theme/classic.js \
  --closure_entry_points Blockly \
  --partialInput \
  --externs \
  ../../closure-compiler/externs/es3.js \
  ../../closure-compiler/externs/es5.js \
  -o blockly.d.ts

cat blockly-polyfill.d.ts >> blockly.d.ts
