const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");

//get events that user is currently not part off
const getEvent = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    //ensure event outputted is not event user has already seen nor event is at capacity
    try {
        const existingEventsId = await knex("user_attendance")
            .select("event_id")
            .where({ guest_user_id: userId })
            .groupBy("event_id")

        let existingEventsList = [];

        existingEventsId.forEach(event => {
            existingEventsList.push(event["event_id"])
        })

        const otherEvents = await knex("event_details")
            .whereNotIn("id", existingEventsList)

        let newEventsResponse;
        
        for(let i=0; i < otherEvents.length; i++) {
            if(otherEvents[i].max_guests > otherEvents[i].total_guests) {
                newEventsResponse = otherEvents[i];
                break
            }
        }

        res.status(200).json(newEventsResponse);
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid auth token");
    }
}

//post a new event
const postEvent = async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    //check if inputs are empty
    const requiredFields = [
        "date",
        "location",
        "max_guests",
        "description"
    ];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `invalid input: ${field} was null or empty`,
            });
        }
    }

    const eventInput = {
        user_id: userId,
        date: req.body.date,
        location: req.body.location,
        max_guests: req.body.max_guests,
        total_guests: 1,
        description: req.body.description
    };

    //output user attendance details
    try {
        const eventId = await knex("event_details").insert(eventInput);

        const newEventId = eventId[0];

        const createdEvent = await knex("event_details")
            .where({ id: newEventId })
            .first();

        const attendanceInput = {
            event_id: newEventId,
            status: "Hosting",
            guest_user_id: userId
        };

        await knex("user_attendance").insert(attendanceInput);

        res.status(201).json(createdEvent);
    } catch (err) {
        res.status(400).send(`Error retrieving events: ${err}`);
    }
}

//get user attendance list for event 
const userAttendanceList = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    //get attendees if they have status pending, going, hosting
    //we do not care about people with status cancelled or uninterested
    try {
        const userAttendanceList = await knex("user_attendance")
            .join("users", "users.id", "user_attendance.guest_user_id")
            .select(
                "users.id",
                "users.first_name",
                "users.last_name",
                "users.picture",
                "user_attendance.id as attendence_id",
                "user_attendance.event_id",
                "user_attendance.status"
            )
            .where({ "user_attendance.event_id": req.params.eventId })
            .whereIn("user_attendance.status", ["Pending", "Going", "Hosting"])

        res.status(200).json(userAttendanceList);
    } catch (error) {
        console.error(error);
        res.status(401).send("Could not get data");
    }
}

//post attendance status when user makes an action from explore page
//status is either uninterested or pending if user wants to attend
const postAttendanceStatus = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    //check that required fields are not empty
    const requiredFields = [
        "event_id",
        "status"
    ];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `invalid input: ${field} was null or empty`,
            });
        }
    }

    const { event_id, status } = req.body;
    const attendanceInput = {
        event_id: event_id,
        status: status,
        guest_user_id: userId
    };

    //add user attendance and output attendance status
    try {
        await knex("user_attendance").insert(attendanceInput);

        const createdAttendanceInput = await knex("user_attendance")
            .where({ event_id: event_id })
            .andWhere({ guest_user_id: userId })
            .first();

        res.status(201).json(createdAttendanceInput);
    } catch (error) {
        console.error(error);
        res.status(401).send("Could not get data");
    }
}

//update attendance status with either going, cancelled or rejected
const updateAttendanceStatus = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    //check if inputs are empty
    const requiredFields = [
        "attendance_id",
        "event_id",
        "status",
        "user_id"
    ];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `invalid input: ${field} was null or empty`,
            });
        }
    }

    const { attendance_id, event_id, status, user_id } = req.body;
    const attendanceInput = {
        event_id: event_id,
        status: status,
        guest_user_id: user_id,
    };

    //if going, increment total guest count
    //if event capacity is at max, set other guests who are pending to rejected
    if (status === "Going") {
        await knex("event_details")
            .where({ id: event_id })
            .increment("total_guests", 1);

        const currentEventDetails = await knex("event_details")
            .where({ id: event_id })
            .first()

        if (currentEventDetails["total_guests"] === currentEventDetails["max_guests"]) {
            await knex("user_attendance")
            .where({ event_id: event_id })
            .andWhere({status: 'Pending'})
            .andWhereNot({ guest_user_id: user_id })
            .update({ status: "Rejected" });
        }
    }

    //update the event status for guest and output attendance status
    await knex("user_attendance")
    .where({ id: attendance_id })
    .update(attendanceInput);

    const createdAttendanceInput = await knex("user_attendance")
        .where({ event_id: event_id })
        .andWhere({ guest_user_id: user_id })
        .first();

    res.status(201).json(createdAttendanceInput);
}

//get upcoming events that user is currently pending or going too
const getUpcomingEvents = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    try {
        const upcomingEvents = await knex("user_attendance")
            .join("event_details", "event_details.id", "user_attendance.event_id")
            .join("users", "users.id", "event_details.user_id")
            .select(
                "event_details.id",
                "event_details.user_id",
                "event_details.date",
                "event_details.location",
                "event_details.max_guests",
                "event_details.description",
                "user_attendance.status",
                "users.picture"
            )
            .whereIn("user_attendance.status", ["Pending", "Going"])
            .andWhere("user_attendance.guest_user_id", userId);

        res.status(200).json(upcomingEvents); 
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid auth token");
    }
}

//get events that user is hosting and check to see if there are pending requests to join the event
const getHostingEvents = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    try {
        //get list of pending events 
        const pendingEvents = await knex("user_attendance")
            .select("event_id")
            .where("status", "Pending")
            .groupBy("event_id")

        let pendingEventsSet = new Set();
        pendingEvents.forEach(event => {
            pendingEventsSet.add(event["event_id"])
        })

        //get list of events user is hosting
        const eventsHosting = await knex("event_details")
            .join("users", "users.id", "event_details.user_id")
            .select(
                "event_details.id",
                "event_details.user_id",
                "event_details.date",
                "event_details.location",
                "event_details.max_guests",
                "event_details.description",
                "users.picture"
            )
            .andWhere("event_details.user_id", userId);

        let eventsHostingDetailed = []

        //output events user is hosting and add pending status if there are requests to join event user has not accepted or declined
        eventsHosting.forEach(event => {            
            const eventDetails = {
                id: event["id"],
                user_id: event["user_id"],
                date: event["date"],
                location: event["location"],
                max_guests: event["max_guests"],
                description: event["description"],
                picture: event["picture"],
                pendingStatus: pendingEventsSet.has(event["id"])
            }
            eventsHostingDetailed.push(eventDetails);
        })

        res.status(200).json(eventsHostingDetailed);
    } catch (error) {
        console.error(error);
        res.status(401).send("Unable to pull events user are hosting");
    }
}

//get events details
const getEventDetails = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    try {
        const eventsResponse = await knex("event_details")
            .where({ "id": req.params.eventId })
            .first();

        res.status(200).json(eventsResponse);
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid auth token");
    }
}

module.exports = {
    getEvent,
    postEvent,
    userAttendanceList,
    postAttendanceStatus,
    updateAttendanceStatus,
    getUpcomingEvents,
    getHostingEvents,
    getEventDetails
};