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

    // Verify the token and get event
    try {
        //pull list of events user is not attending
        const newEventsId = await knex("user_attendance")
            .select("event_id")
            .whereNot({ guest_user_id: userId })
            .groupBy("event_id")

        let newEventsList = []
        newEventsId.forEach(event => {
            newEventsList.push(event["event_id"])
        })

        //redo map and then do first next when the guest is not over

        //pull event details
        const newEventsResponse = await knex("event_details")
            .whereIn("id", newEventsList)
            .andWhere("max_guests", ">", "total_guests")
            .first();

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

    const requiredFields = [
        "date",
        "time",
        "location",
        "max_guests",
        "description"
    ];

    //check if inputs are empty
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

    //find the user and create token
    try {
        const eventId = await knex("event_details").insert(eventInput);

        const newEventId = eventId[0];

        const createdEvent = await knex("event_details")
            .where({ id: newEventId })
            .first();

        //which one to put in response probably created Event
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

//get upcoming events
const getUpcomingEvents = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    // Verify the token and get event
    try {
        //pull list of events user is attending or pending
        const upcomingEvents = await knex("user_attendance")
            .join("event_details", function () {
                this.on("event_details.id", "user_attendance.event_id")
            })
            .select(
                "event_details.id",
                "event_details.user_id",
                "event_details.date",
                "event_details.location",
                "event_details.max_guests",
                "event_details.description",
                "user_attendance.status"
            )
            .whereIn("user_attendance.status", ["Pending", "Going"])
            .andWhere("user_attendance.guest_user_id", userId);

        res.status(200).json(upcomingEvents); //remember user_id is host
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid auth token");
    }
}

//get upcoming events
const getHostingEvents = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(authToken, "secret_key");
    const userId = decodedToken.id;

    // Verify the token and get event
    try {
        //pull list of events user is hosting and status if pending to notify
        const pendingEvents = await knex("user_attendance")
            .select("event_id")
            .where("status", "Pending")
            .groupBy("event_id")

        let pendingEventsSet = newSet();
        pendingEvents.forEach(event => {
            pendingEventsSet.add(event["event_id"])
        })

        const eventsHosting = await knex("event_details")
            .select(
                "id",
                "user_id",
                "date",
                "location",
                "max_guests",
                "description"
            )
            .andWhere("event_details.user_id", userId);

        let eventsHostingDetailed = []

        eventsHosting.forEach(event => {
            const eventDetails = {
                id: event["id"],
                user_id: event["user_id"],
                date: event["date"],
                location: event["location"],
                max_guests: event["max_guests"],
                description: event["description"],
                pendingStatus: pendingEventsSet.has(event["id"])
            }
            eventsHostingDetailed.push(eventDetails);
        })

        res.status(200).json(eventsHostingDetailed);
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid auth token");
    }
}


module.exports = {
    getEvent,
    postEvent,
    getUpcomingEvents,
    getHostingEvents,

};

/*,
    joinEventRequest,
    updateEventStatus,
    //users?
*/

//users need to put if they care about going