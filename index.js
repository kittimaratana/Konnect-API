const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;
//const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8081";
const authRoutes = require('./routes/auth-routes');
const usersRoutes = require('./routes/users-routes');
const eventsRoutes = require('./routes/events-routes');

//allows request to get static assets in /public folder
app.use(express.static("public"));

// Express middleware
app.use(express.json());
//app.use(cors({ origin: CORS_ORIGIN }));
app.use((req, _res, next) => {
    next();

});

// // Configuring users endpoints
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/events', eventsRoutes);

app.get('/', (_req, res) => {
    res.send('Welcome to Konnect API');
  });

app.listen(PORT, function () {
    console.log(`Server is now listening at ${PORT}`);
});