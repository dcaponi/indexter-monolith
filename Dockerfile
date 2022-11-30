#!/bin/bash
FROM --platform=linux/amd64 node:18.12-slim
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "build/server.js" ]