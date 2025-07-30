FROM nginx:alpine

COPY /nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html/

COPY /dist/ .
