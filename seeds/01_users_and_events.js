const { faker } = require('@faker-js/faker');
const { activities, petPeeves } = require("../variables/constants");
const {v4: uuid} = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//create randomizer pet peeves
function randomItem(field) {
  return field[Math.floor((Math.random() * field.length))]
}

//ensuring if user is making event it aligns with their interest
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

function createUser() {
  let users = [];
  let events = [];
  
  for(let i=0; i<200;i++) {

    const {interests, eventDetails} = interestList();
    const userUuid = uuid();

    users.push({
      id: userUuid,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      gender: faker.person.gender(),
      birthday: faker.date.between({from: '1980-01-01', to: '2014-01-05'}).toLocaleString("en-CA").substring(0,10),
      career: faker.person.jobTitle(),
      city: faker.location.city(),
      interests: `${interests}`,
      picture: faker.image.avatar(),
      bio: faker.person.bio(),
      pet_peeves: randomItem(petPeeves)
    });

    //every 10th person make an event but users can only make one event
    if (i%10 === 0) {
      const eventDetail = eventDetails[0];

      events.push({
        user_id: userUuid,
        date: faker.date.between({from: '2024-04-05', to: '2024-04-19'}).toLocaleString("en-CA").substring(0,10),
        location: eventDetail.location,
        max_guests: Math.floor(Math.random()*7) + 2,
        total_guests: 1,
        description: eventDetail.description
      })
    }
  }

  return {users, events}
  //image: faker.image.urlLoremFlickr({ category: 'people' }),
};

const {users, events} = createUser();

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('users').insert(users);

  await knex('event_details').del();
  await knex('event_details').insert(events);
}



//midjourney 
//https://www.pexels.com/search/profile%20picture/
