const router = require('express').Router();
const eventsController = require('../controllers/events-controller');

router.route("/").get(eventsController.getEvent).post(eventsController.postEvent)
router.route("/:eventId").get(eventsController.userAttendanceList).post(eventsController.postAttendanceStatus).put(eventsController.updateAttendanceStatus)
router.route("/user/upcoming-events").get(eventsController.getUpcomingEvents)
router.route("/user/hosting-events").get(eventsController.getHostingEvents)

module.exports = router;

/*
{
    "id": 55,
    "user_id": "8f3e5e02-f98f-412c-9b08-224f6f30001d",
    "date": "2022-01-01T05:00:00.000Z",
    "location": "Terroni",
    "max_guests": 9,
    "total_guests": 1,
    "description": "Come meet me for pasta"
}
*/