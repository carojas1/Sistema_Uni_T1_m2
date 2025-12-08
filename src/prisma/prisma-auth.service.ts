import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client-auth';
import { Pool } from 'pg';

@Injectable()
export class PrismaAuthService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const pool = new Pool({
            connectionString: process.env.DATABASE_AUTH_URL,
        });

        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Connected to Auth Database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from Auth Database');
    }
}
