# ===== Base =====
FROM node:20-alpine

WORKDIR /app

# ===== Install deps =====
COPY package*.json ./
RUN npm install

# ===== Copy project =====
COPY . .

# ===== Prisma generate =====
RUN npx prisma generate

# ===== Build Next.js =====
RUN npm run build

# ===== Port =====
EXPOSE 3000

# ===== Start app =====
CMD ["npm", "start"]