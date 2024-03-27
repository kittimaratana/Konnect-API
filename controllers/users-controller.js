const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const multer = require('multer');

//fields to select for users
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

let imageName="";

//middleware to upload images
const imageStorage = multer.diskStorage({
  destination: './public/images/',
  filename: (req, file, cb) => {
    const filename = `${imageName}.jpg`;  
    cb(null, filename);
  }
})
const uploadImage = multer({storage: imageStorage});

//get main user profile
/* GET
http://localhost:5001/users
 headers: {
    authorization: "Bearer " + token,
  },
  data: {
    // Your body data here
  }
*/

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
    "picture",
    "bio",
    "pet_peeves"
  ];

  //check if inputs are empty
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        message: `invalid input: ${field} was null or empty`,
      });
    }
  }

  //pull details that users are not able to update themselves 
  try {
    const userResponse = await knex("users")
      .where({ id: userId })
      .first();

    if (userResponse.length === 0) {
      return res.status(404).json({
        message: `User was not found`,
      });
    }
    uploadImage.single('image');

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
      picture: `/images/${imageName}.jpg`, 
      bio: req.body["bio"],
      pet_peeves: req.body["pet_peeves"]
    };

    //update user row
    const rowsUpdated = await knex("users")
      .where({ id: updatedUserAccount.id })
      .update(updatedUserAccount);

    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `User was not updated`,
      });
    }

    //send data back to user
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

const getOtherUser = async (req, res) => {

  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }

  /* i dont think i need this again right?
  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(authToken, "secret_key");
  */

  // Verify the token and call user to get details
  //get users
  //http://localhost:5001/users/005f690d-15bf-4b90-b8f1-187a0f716367
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
