const { faker } = require('@faker-js/faker');
const { activities, petPeeves, userProfile } = require("../variables/constants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//create randomizer to select item from list
function randomItem(field) {
  return field[Math.floor((Math.random() * field.length))]
}

//ensure user event aligns with their interest
function interestList() {
  let interests = [];
  let eventDetails = [];

  for(let i=0; i<3; i++) {
    const currentActivity = randomItem(activities);
    interests.push(currentActivity.activity);
    eventDetails.push(currentActivity);
  }

  return {interests, eventDetails}
}

//create 50 person fake data profile
//gender, name and images are predefined to ensure the test dataset makes sense
function createUser() {
  let users = [];
  let events = [];
  
  for(let i=0; i<50;i++) {
    const {interests, eventDetails} = interestList();

    users.push({
      id: userProfile[i]["id"],
      first_name: userProfile[i]["first_name"], 
      last_name: userProfile[i]["last_name"], 
      email: faker.internet.email(),
      password: faker.internet.password(),
      gender: userProfile[i]["gender"],
      birthday: faker.date.between({from: '1980-01-01', to: '2014-01-05'}).toLocaleString("en-CA").substring(0,10),
      career: faker.person.jobTitle(),
      city: faker.location.city(),
      interests: `${interests}`,
      picture: `/images/${userProfile[i]["id"]}.jpg`, 
      bio: faker.person.bio(),
      pet_peeves: randomItem(petPeeves)
    });

    //every 5th person make an event and set total_guests to 2 currently as user_attendance seed will add a "going" guest to the event
    //set max guests to minimum 3 as we want the max guests to be larger than total guests so users can still request to join and see event in the explore page
    if (i%5 === 0) {
      const eventDetail = eventDetails[0];

      events.push({
        user_id: userProfile[i]["id"],
        date: faker.date.between({from: '2024-04-05', to: '2024-04-19'}).toLocaleString("en-CA").substring(0,10),
        location: eventDetail.location,
        max_guests: Math.floor(Math.random()*7) + 3, 
        total_guests: 2, 
        description: eventDetail.description
      })
    }
  }

  return {users, events}
};

const {users, events} = createUser();

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('users').insert(users);

  await knex('event_details').del();
  await knex('event_details').insert(events);
}

