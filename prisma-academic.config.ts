import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema-academic.prisma',
  datasource: {
    url: env('DATABASE_ACADEMIC_URL'),
  },
})
