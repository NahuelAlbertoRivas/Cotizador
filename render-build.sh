#!/usr/bin/env bash

set -o errexit

#Install dependencies
npm install-all

#por si es necesario reconstruir
npm run build

cd backend

#asegurar que exista la dirección de cache para Puppeteer
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

#instalar pup y descargar chrome
npx puppeteer browsers intall chrome

#guadar/pull la cache con build cache
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
    echo "...Copying Puppeteer Cache from Build Cache"
    #copiando de la dirección donde Puppeteer guarda chrome
    cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
    echo "...Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
fi

cd ..