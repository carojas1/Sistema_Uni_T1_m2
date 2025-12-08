import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema-support.prisma',
  datasource: {
    url: env('DATABASE_SUPPORT_URL'),
  },
})
