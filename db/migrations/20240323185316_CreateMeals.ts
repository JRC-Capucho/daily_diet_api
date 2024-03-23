import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (t) => {
    t.uuid("id").primary();
    t.text("name").notNullable();
    t.text("description").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.boolean("is_diet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
