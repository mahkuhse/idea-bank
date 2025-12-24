import { defineConfig } from '@prisma/client';

export default defineConfig({
  url: process.env.DATABASE_URL,
});
