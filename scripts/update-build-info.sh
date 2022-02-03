#!/bin/bash

HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(git log -1 --format=%cI)

echo \{\"hash\":\"$HASH\",\"ts\":\"$TIMESTAMP\"\} > ./src/buildInfo.json
