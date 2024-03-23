const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const {v4: uuid} = require('uuid');

/* POST
http://localhost:5001/auth/login 
{
    "email": "Kelsi24@yahoo.com",
    "password": "JyqxXpz6dcONsVB"
}
*/

//login to an existing account
const login = async(req,res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(404).send("Please enter the required fields");
  }

  //find the user and create token
  try {
    const user = await knex("users")
      .where({email})
      .andWhere({password})

    if (user.length===0) {
      return res.status(400).send("Invalid email");
    }

    const token = jwt.sign({id: user.id}, "secret_key", {expiresIn: "24h"})
    res.status(200).send({ token });
  } catch (err) {
    res.status(400).send(`Error retrieving users: ${err}`);
  }
}

/* POST 
http://localhost:5001/auth/register
{
    "first_name": "Kittima",
    "last_name": "Ratana",
    "email": "kittima.ratana@gmail.com",
    "password": "JyqxXpz6dcONsVf"
}
*/

//register for a new account
const register = async(req,res) => {
  const {first_name, last_name, email, password} = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(404).send("Please enter the required fields");
  }

  const userAccount = {
    id: uuid(),
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: password,
    gender: "Female",
    birthday: "2000-01-01",
    career: "No career listed",
    city: "Toronto",
    interests: `[No interests]`,
    picture: "https://loremflickr.com/cache/resized/65535_52899529118_604975ef03_h_640_480_nofilter.jpg",
    bio: "No bio",
    pet_peeves: "No pet peeves"
  };

  //find the user and create token
  try {
    const userResult = await knex("users").insert(userAccount);

    const token = jwt.sign({id: userAccount.id}, "secret_key", {expiresIn: "24h"})
    res.status(200).send({ token });
  } catch (err) {
    res.status(400).send(`Error retrieving users: ${err}`);
  }
}

module.exports = {
  login, 
  register
};
