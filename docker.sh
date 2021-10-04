#!/bin/bash

docker build -t greenpass2json:latest . 

docker stop greenpass2json || :

docker rm greenpass2json || :

docker run \
--env LOG_LOGLEVEL="${G2J_LOGLEVEL}" \
--name greenpass2json \
--restart unless-stopped \
-p "${G2J_PORT}":3000 \
-d greenpass2json:latest
