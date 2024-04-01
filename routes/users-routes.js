//user routes and adding multer middleware for image uploads
const router = require('express').Router();
const multer = require('multer');
const usersController = require('../controllers/users-controller');

//add middleware to upload images
const imageStorage = multer.diskStorage({
  destination: './public/images/',
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  }
})
const uploadImage = multer({storage: imageStorage});

router.route("/").get(usersController.getUser).put(uploadImage.single('picture'), usersController.updateUser);
router.route("/:userId").get(usersController.getOtherUser)

module.exports = router;