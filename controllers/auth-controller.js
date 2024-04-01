const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const {v4: uuid} = require('uuid');

//login to an existing account
const login = async(req,res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(404).send("Please enter the required fields");
  }

  //find the user and create token
  try {
    const user = await knex("users")
      .where({email: email})
      .andWhere({password: password})
      .first();

    if (user.id === "") {
      return res.status(400).send("Invalid email");
    }

    const token = jwt.sign({id: user.id}, "secret_key", {expiresIn: "24h"})
    res.status(200).send({ token });
  } catch (err) {
    res.status(401).send(`Login credentials do not match`);
  }
}

//register for a new account
const register = async(req,res) => {
  const {first_name, last_name, email, password} = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(404).send("Please enter the required fields");
  }

  //most information are placeholder values until user adds their profile details in the register profile screen
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
    picture: "/images/0e09fea2-6bcc-4dd6-8cb6-d3e6473875df.jpg",
    bio: "No bio",
    pet_peeves: "No pet peeves"
  };

  //create new user account and send token back
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
