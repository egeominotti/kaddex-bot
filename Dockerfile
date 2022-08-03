FROM node:lts-alpine
ENV NODE_ENV=production
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm update
RUN npm i -g npm
RUN npm install
COPY . .
CMD [ "npm", "start"]
