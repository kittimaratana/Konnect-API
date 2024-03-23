const router = require('express').Router();
const eventsController = require('../controllers/events-controller');

router.route("/").get(eventsController.getEvent).post(eventsController.postEvent)
router.route("/upcoming-events").get(eventsController.getUpcomingEvents)
router.route("/hosting-events").get(eventsController.getHostingEvents)

module.exports = router;