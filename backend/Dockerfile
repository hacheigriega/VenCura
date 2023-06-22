FROM node:18-alpine

ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]

EXPOSE 8000
