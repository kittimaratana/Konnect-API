/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//user_attendance table migration
exports.up = function (knex) {
    return knex.schema.createTable('user_attendance', (table) => {
        table.increments('id').primary();
        table
        .integer('event_id')
        .unsigned()
        .references('event_details.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
        table.string('status').notNullable();
        table
        .uuid('guest_user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user_attendance');
};
