FROM node:21

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3567

CMD ["npm", "run", "start"]
