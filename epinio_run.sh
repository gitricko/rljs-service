#!/bin/bash
set -e

echo "Retrieving K8 Variables in /configurations folders.."
export MONGODB_HOST=${MONGODB_CONFIG}
export MONGODB_PORT=27017
export MONGODB_USR=root
export MONGODB_PWD=$(cat /configurations/${MONGODB_CONFIG}/mongodb-root-password)

npm run epinio