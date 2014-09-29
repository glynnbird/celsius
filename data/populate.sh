#!/bin/bash

# check for environment variable
if [ -z "$COUCH_URL" ] 
then
  echo "Need to set COUCH_URL in environment"
  echo "  e.g. export COUCH_URL=http://127.0.0.1:5984"
  exit 1
fi

# check that ccurl is installed
hash ccurl 2>/dev/null || { echo >&2 "Need 'ccurl' installed. Try 'sudo npm install -g ccurl'"; exit 1; }

echo "Creating the database"
ccurl -X PUT /logger


echo "Adding design docs"
ccurl -X POST -d @design.json /logger/_bulk_docs

