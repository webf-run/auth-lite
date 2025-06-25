import { faker } from '@faker-js/faker';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { email } from 'zod/v4';

import { user } from '../../Schema/Schema.js';

export function makeSeeder(db: BetterSQLite3Database) {
  return {
    async createUser() {
      const userId = faker.string.uuid();
      const userSeed = {
        id: userId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),

        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),

        emails: [
          {
            id: faker.string.uuid(),
            email: faker.internet.email(),
            verified: faker.datatype.boolean(),
            userId: userId,
          },
          {
            id: faker.string.uuid(),
            email: faker.internet.email(),
            verified: faker.datatype.boolean(),
            userId: userId,
          },
        ],
      };

      await db.insert(user).values(userSeed);
      return userSeed;
    },
  };
}
