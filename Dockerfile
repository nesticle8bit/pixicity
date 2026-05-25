FROM node:22-alpine AS build

# set working directory
WORKDIR /opt/ng
COPY package.json ./
RUN npm i --legacy-peer-deps

COPY . ./
RUN node node_modules/@angular/cli/bin/ng build --configuration=production

### STAGE 2: Run ###
FROM nginx:1.27-alpine
COPY --from=build /opt/ng/nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/ng/dist/pixicity/browser /usr/share/nginx/html