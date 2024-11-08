FROM node:18-alpine AS build

WORKDIR /app

COPY ./react-event-app/package.json ./react-event-app/package-lock.json ./

RUN npm install

COPY ./react-event-app .

RUN npm run build

FROM nginx:stable-alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
