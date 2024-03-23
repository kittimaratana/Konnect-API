const router = require('express').Router();
const usersController = require('../controllers/users-controller');


router.route("/").get(usersController.getUser).put(usersController.updateUser);
router.route("/:userId").get(usersController.getOtherUser)

module.exports = router;