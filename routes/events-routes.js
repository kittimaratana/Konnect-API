const router = require('express').Router();
const eventsController = require('../controllers/events-controller');

router.route("/").get(eventsController.index)

module.exports = router;