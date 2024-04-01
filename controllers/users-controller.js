const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");

//fields to select for users excluding fields like password
const userAttr = [
  "id",
  "first_name",
  "last_name",
  "email",
  "gender",
  "birthday",
  "career",
  "city",
  "interests",
  "picture",
  "bio",
  "pet_peeves"
];

//get main user profile
const getUser = async (req, res) => {

  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }

  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(authToken, "secret_key");
  const userId = decodedToken.id;

  // Verify the token and call user to get details
  try {
    const userResponse = await knex("users")
      .select(userAttr)
      .where({ id: userId })
      .first();

    res.status(200).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid auth token");
  }
}

//add user profile information to users table
//placeholder data was added when user first added their register login credentials and now users are filling out additional profile details
const updateUser = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }

  //check user authorization
  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(" ")[1]; 
  const decodedToken = jwt.verify(authToken, "secret_key");
  const userId = decodedToken.id;
  imageName = userId;

  const requiredFields = [
    "gender",
    "birthday",
    "career",
    "city",
    "interests",
    "bio",
    "pet_peeves",
    "picture_name"
  ];

  //check if inputs are empty
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        message: `invalid input: ${field} was null or empty`,
      });
    }
  }

  //pull details that users are not able to update themselves like password and email
  try {
    const userResponse = await knex("users")
      .where({ id: userId })
      .first();

    if (userResponse.length === 0) {
      return res.status(404).json({
        message: `User was not found`,
      });
    }

    const updatedUserAccount = {
      id: userResponse.id,
      first_name: userResponse["first_name"],
      last_name: userResponse["last_name"],
      email: userResponse["email"],
      password: userResponse["password"],
      gender: req.body["gender"],
      birthday: req.body["birthday"],
      career: req.body["career"],
      city: req.body["city"],
      interests: req.body["interests"],
      picture: `/images/${req.body["picture_name"]}`, 
      bio: req.body["bio"],
      pet_peeves: req.body["pet_peeves"]
    };

    //update user row and send back user details
    const rowsUpdated = await knex("users")
      .where({ id: updatedUserAccount.id })
      .update(updatedUserAccount);

    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `User was not updated`,
      });
    }

    const updatedUserResponse = await knex("users")
      .select(userAttr)
      .where({ id: updatedUserAccount.id })
      .first();

    res.status(200).json(updatedUserResponse);

  } catch (error) {
    console.error(error);
    res.status(401).send("Unable to update user account");
  }
}

//get other user details
const getOtherUser = async (req, res) => {

  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }

  try {
    const userResponse = await knex("users")
      .select(userAttr)
      .where({ id: req.params.userId })
      .first();

    res.status(200).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid auth token");
  }
}

module.exports = {
  getUser,
  updateUser,
  getOtherUser
};
