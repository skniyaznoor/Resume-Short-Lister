FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build step if needed, but for dev we can just run next dev
# RUN npm run build

CMD ["npm", "run", "dev"]
