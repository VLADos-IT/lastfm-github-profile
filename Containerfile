FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

COPY .env.example .env

EXPOSE 3000

CMD ["npm", "start"]
