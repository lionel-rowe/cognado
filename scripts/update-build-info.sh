#!/bin/bash

HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(git log -1 --format=%cI)

JSON="{\"hash\":\"$HASH\",\"ts\":\"$TIMESTAMP\"}"

echo $JSON > ./src/buildInfo.json
