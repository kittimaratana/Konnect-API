//user attendance seeds
const knex = require("knex")(require("../knexfile"));
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

      //add host to user attendance
      user_attendance.push({
        event_id: events[i]["id"],
        status: "Hosting",
        guest_user_id: events[i]["user_id"]
      });

      //add a random user as guest going and pending
      const randomUser = await knex("users")
      .select("id")
      .whereNot({id: events[i]["user_id"]})

      //minus 1 as we want the index after to be the person pending
      const goingIndex = Math.floor(Math.random() * (randomUser.length-1));
      pendingIndex = goingIndex + 1;

      user_attendance.push({
        event_id: events[i]["id"],
        status: "Going",
        guest_user_id: randomUser[goingIndex]["id"]
      });

      user_attendance.push({
        event_id: events[i]["id"],
        status: "Pending",
        guest_user_id: randomUser[pendingIndex]["id"]
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