import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema-auth.prisma',
  datasource: {
    url: env('DATABASE_AUTH_URL'),
  },
})
