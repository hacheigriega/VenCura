FROM node:14 as build-stage


WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:14-alpine as production-stage


WORKDIR /app

COPY --from=build-stage /app/dist ./dist
RUN npm install -g serve

CMD ["serve", "-s", "dist"]

EXPOSE 3000
