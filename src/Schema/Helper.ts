import decamelize from 'decamelize';
import {
  customType,
  integer,
  sqliteTableCreator,
} from 'drizzle-orm/sqlite-core';

export interface CustomTimestampConfig {
  data: Date;
  driverData: string;
  config: never;
}

/** Same as `sqliteTable` but helps with casing. */
export const table = sqliteTableCreator(decamelize);

export const timestampMS = (columnName: string) =>
  integer(columnName, {
    mode: 'timestamp_ms',
  });

export const timestamp = customType<CustomTimestampConfig>({
  dataType(config) {
    return 'text';
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
  toDriver(value: Date): string {
    return value.toISOString();
  },
});
