FROM node:10

WORKDIR /app

COPY ./Server/setup.js ./Server/
COPY ./Server/package*.json ./Server/
COPY ./Server/lib/package*.json ./Server/lib/

RUN cd Server && node setup

COPY . .

RUN cd Server/lib && npx grunt default pack

WORKDIR /kkutu