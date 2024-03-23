import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (t) => {
    t.uuid("user_id").after("id").index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (t) => {
    t.dropColumn("user_id");
  });
}
