/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//users table migration
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo('uuid_generate_v4()');
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('gender').notNullable();
        table.date('birthday').notNullable();
        table.string('career').notNullable();
        table.string('city').notNullable();
        table.string('interests').notNullable();
        table.string('picture').notNullable();
        table.string('bio').notNullable();
        table.string('pet_peeves').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
