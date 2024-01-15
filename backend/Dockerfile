FROM node:latest
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build
CMD [ "npm", "run", "start" ]