const knex = require("knex")(require("../knexfile"));
//const { useState } = require('react');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const event_details = async (_req, res) => {
  let user_attendance = [];
  try {
    const events = await knex("event_details")
      .select(
        "id",
        "user_id"
      );

    for (let i = 0; i < events.length; i++) {

      user_attendance.push({
        event_id: events[i]["id"],
        status: "Hosting",
        guest_user_id: events[i]["user_id"]
      });
    }

    return user_attendance
  } catch (err) {
    console.log(err);
  }
};

exports.seed = async function (knex) {
  const user_attendance = await event_details();
  await knex('user_attendance').del();
  await knex('user_attendance').insert(user_attendance);
};