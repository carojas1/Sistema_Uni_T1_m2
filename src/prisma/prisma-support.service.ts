import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client-support';
import { Pool } from 'pg';

@Injectable()
export class PrismaSupportService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const pool = new Pool({
            connectionString: process.env.DATABASE_SUPPORT_URL,
        });

        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Connected to Support Database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from Support Database');
    }
}
