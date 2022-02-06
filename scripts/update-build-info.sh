#!/bin/bash

HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(git log -1 --format=%cI)

JSON="{\"hash\":\"$HASH\",\"ts\":\"$TIMESTAMP\"}"

echo -e "\n\e[36mHEAD $HASH\e[39m\n"

echo $JSON > ./src/buildInfo.json
