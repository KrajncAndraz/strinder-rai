FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--tunnel", "--non-interactive"]