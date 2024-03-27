const { faker } = require('@faker-js/faker');
const {v4: uuid} = require('uuid');
let users = [];

//created as faker doesnt have good profile images so images are pull from pexels
//images must match user name, gender and uuid hence this is predefined
//ran once before start and modify the gender to match with name if incorrect
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

console.log(users);