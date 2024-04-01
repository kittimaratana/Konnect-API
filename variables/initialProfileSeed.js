const { faker } = require('@faker-js/faker');
const {v4: uuid} = require('uuid');
let users = [];

//users do not need to touch this file -----
//completed manually before seed run to ensure user name matches gender and picture
for(let i=0; i<50;i++) {
    let genderSex = faker.person.sex()

    user = {
        id: uuid(), //predefined
        first_name: faker.person.firstName(), //predefined
        last_name: faker.person.lastName(), //predefined
        gender: i%10===0 ? faker.person.gender(): genderSex.charAt(0).toUpperCase() + genderSex.slice(1), //predefined 
    }
    users.push(user);
}