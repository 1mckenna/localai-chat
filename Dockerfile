# First stage
FROM node:20.11.1-alpine3.19 AS build
ENV NODE_ENV=production
RUN mkdir -p /srv/app
WORKDIR /srv/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
COPY entrypoint.sh ./

# Second stage
FROM node:20.11.1-alpine3.19 as final
RUN mkdir -p /srv/app
WORKDIR /srv/app
COPY --from=build /srv/app/ ./
RUN chown -R node /srv/app
RUN npm install -g serve
EXPOSE 3000
USER node
CMD ["/bin/sh", "./entrypoint.sh"]