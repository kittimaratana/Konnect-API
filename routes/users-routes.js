//user routes and adding nulter middleware for image uploads
const router = require('express').Router();
const express = require('express');
const multer = require('multer');
const usersController = require('../controllers/users-controller');

//add middleware to upload iamges
const imageStorage = multer.diskStorage({
  destination: './public/images/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})
const uploadImage = multer({storage: imageStorage});

router.route("/").get(usersController.getUser).put(uploadImage.single('picture'), usersController.updateUser);
router.route("/:userId").get(usersController.getOtherUser)

module.exports = router;