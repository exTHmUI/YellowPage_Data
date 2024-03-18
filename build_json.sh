#!/bin/bash

if [ -d "yellowpage_data/" ];then
    echo "Clean old yellow page data"
    rm -rf yellowpage_data/
    rm YellowPage_data.json
fi
echo "Merge vCard data..."
cp -r data/ yellowpage_data/
python convert_data.py
if [ $? -eq 1 ];then
    echo "Merge data error"
    exit
fi
npm install
if [ $? -eq 0 ];then
    npm run buildJson
    npm run cleanJson
    echo "Build done"
else
    echo "node module install failed"
    exit
fi
