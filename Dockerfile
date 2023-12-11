ARG PORT=3001
FROM node:20

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm i

COPY . .
# Use env for port, read by app
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD [ "node", "index.js" ]
