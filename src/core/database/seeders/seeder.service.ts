import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataBaseService } from '../database.service';
import { hash } from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private readonly database: DataBaseService) {}

  async defaultSuperAdmin() {
    const username = process.env.SUPER_ADMIN_USERNAME as string;
    const email = process.env.SUPER_ADMIN_EMAIL as string;
    const pass = process.env.SUPER_ADMIN_PASSWORD as string;
    const password = await hash(pass, 12);

    return await this.database.user.upsert({
      where: { username, email },
      update: {},
      create: { username, email, password, role: 'SUPER_ADMIN' },
    });
  }

  async defaultAdmin() {
    const username = 'admin1';
    const email = 'admin1@gmail.com';
    const pass = 'admin1xxxx';
    const password = await hash(pass, 12);

    return await this.database.user.upsert({
      where: { username, email },
      update: {},
      create: { username, email, password, role: 'ADMIN' },
    });
  }

  async defaultUser() {
    const username = 'user1';
    const email = 'user1@gmail.com';
    const pass = 'user1xxxx';
    const password = await hash(pass, 12);

    return await this.database.user.upsert({
      where: { username, email },
      update: {},
      create: { username, email, password, role: 'USER' },
    });
  }

  async onModuleInit() {
    try {
      await this.defaultSuperAdmin();
      await this.defaultAdmin();
      await this.defaultUser();
    } catch (error) {
      console.log(error.message);
      process.exit(1);
    } finally {
      this.database.$disconnect();
    }
  }
}
