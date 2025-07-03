# 1단계: 빌드
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 2단계: 실행
FROM node:20
WORKDIR /app
COPY --from=builder /app /app
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start"]
