const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const usersRoutes = require('./routes/users-routes');
//const usersRoutes = require('./routes/users-routes');

// Express middleware
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));
app.use((req, _res, next) => {
    next();

});

// // Configuring users endpoints
app.use('/api/users', usersRoutes);
// // Configuring users endpoints
//app.use('/api/users', usersRoutes);

app.get('/', (_req, res) => {
    res.send('Welcome to Konnect API');
  });

app.listen(PORT, function () {
    console.log(`Server is now listening at ${PORT}`);
});