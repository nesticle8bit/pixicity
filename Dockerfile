FROM node:22-alpine AS build

# set working directory
WORKDIR /opt/ng
# Con el lockfile y `npm ci` el build instala exactamente las versiones auditadas (antes `npm i` ignoraba package-lock.json).
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . ./
RUN node node_modules/@angular/cli/bin/ng build --configuration=production

### STAGE: SSR (solo para bots) ###
# Render en el servidor de Angular: nginx le manda a los bots (Google, redes sociales) y reemplaza a rendertron.
#   docker build --target ssr -t pixicity-ssr .
FROM node:22-alpine AS ssr
WORKDIR /app
ENV NODE_ENV=production PORT=4000
# El bundle del servidor ya incluye sus dependencias (express, @angular/ssr): no hace falta node_modules.
COPY --from=build /opt/ng/dist/pixicity ./dist/pixicity
USER node
EXPOSE 4000
CMD ["node", "dist/pixicity/server/server.mjs"]

### STAGE 2: Run (default) ###
FROM nginx:1.27-alpine
COPY --from=build /opt/ng/nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/ng/dist/pixicity/browser /usr/share/nginx/html
# Con SSR activado Angular genera index.csr.html (la app de cliente) en vez de index.html: nginx sirve esa misma
# página a las personas. Sin este paso nginx respondía 404 en la portada.
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html
