#!/bin/bash
# convert-to-safari.sh
# This script runs gulp build and then runs xcrun safari-web-extension-converter on the dist folder.

echo "Starting gulp build..."
if gulp build; then
  echo "Build succeeded. Converting extension to Safari format..."
  xcrun safari-web-extension-converter dist
else
  echo "Build failed. Aborting conversion." >&2
  exit 1
fi