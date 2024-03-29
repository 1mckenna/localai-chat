#!/bin/sh

if [ -z "$API_HOST" ]
then
    API_HOST='http://localhost:8080'
fi

echo "REACT_APP_SERVER_URL=$API_HOST" >> ./.env
npm run build
exec serve -s ./build