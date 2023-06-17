"use strict";

/** Express app for gardener. */

const express = require('express');
const { json } = require('express');

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./auth");

const usersRoutes = require("./routes/users");
const plantsRoutes = require("./routes/plants");
const gardensRoutes = require("./routes/gardens");
const authRoutes = require("./routes/auth");
const trefleRoutes = require("./routes/trefle");

const app = express();

app.use(json());
const { drop_tables, create_tables } = require('./db');

app.use(authenticateJWT);

app.use("/users", usersRoutes);
app.use(usersRoutes);

app.use("/plants", plantsRoutes);
app.use(plantsRoutes);

app.use("/gardens", gardensRoutes);
app.use(gardensRoutes);

app.use("/auth", authRoutes);
app.use(authRoutes);

app.use("/trefle", trefleRoutes);
app.use(trefleRoutes);

// Uncomment to create tables
// drop_tables();
// create_tables();

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;