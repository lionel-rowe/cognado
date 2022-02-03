#!/bin/bash

BRANCH=$(git symbolic-ref --short HEAD)
HASH=$(git rev-parse --short $BRANCH)
TIMESTAMP=$(git log -1 --format=%cI)

echo \{\"hash\":\"$HASH\",\"ts\":\"$TIMESTAMP\"\} > ./src/buildInfo.json
