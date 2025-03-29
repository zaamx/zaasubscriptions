import { Migration } from '@mikro-orm/migrations';

export class Migration20250329073250 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "subscription" drop constraint if exists "subscription_interval_check";`);

    this.addSql(`alter table if exists "subscription" add constraint "subscription_interval_check" check("interval" in ('weekly', 'monthly', 'yearly'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "subscription" drop constraint if exists "subscription_interval_check";`);

    this.addSql(`alter table if exists "subscription" add constraint "subscription_interval_check" check("interval" in ('monthly', 'yearly'));`);
  }

}
