FROM node:14.15-alpine AS build

# set working directory
WORKDIR /opt/ng
COPY package.json ./
RUN npm i --legacy-peer-deps

ENV PATH="./node_modules/.bin:$PATH" 

COPY . ./
RUN ng build --configuration=production

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY --from=build /opt/ng/nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/ng/dist/pixicity /usr/share/nginx/html