const router = require('express').Router();
const eventsController = require('../controllers/events-controller');

router.route("/").get(eventsController.getEvent).post(eventsController.postEvent)
router.route("/:eventId").get(eventsController.userAttendanceList).post(eventsController.postAttendanceStatus).put(eventsController.updateAttendanceStatus)
router.route("/:eventId/details").get(eventsController.getEventDetails)
router.route("/user/upcoming-events").get(eventsController.getUpcomingEvents)
router.route("/user/hosting-events").get(eventsController.getHostingEvents)

module.exports = router;
