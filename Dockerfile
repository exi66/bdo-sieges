FROM node:alpine

RUN npm install -g http-server

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build && rm -rf node_modules

EXPOSE 8080

CMD [ "http-server", "dist" ]