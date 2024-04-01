/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//event_details table migration
exports.up = function (knex) {
    return knex.schema.createTable('event_details', (table) => {
        table.increments('id').primary();
        table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
        table.date('date').notNullable();
        table.string('location').notNullable();
        table.integer('max_guests').notNullable();
        table.integer('total_guests').notNullable();
        table.string('description').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('event_details');
};
