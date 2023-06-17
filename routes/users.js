'use strict';

/** Routes for users. */
const { db } = require('../db');
const jsonschema = require('jsonschema');

const express = require('express');
const { isAdmin, isUser } = require('../auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const { createToken } = require('../auth');
const userNewSchema = require('../schemas/userNew.json');
const userUpdateSchema = require('../schemas/userUpdate.json');

const router = express.Router();

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

/**Get all users */
router.get('/', async function (req, res, next) {
    try {
        const users = await User.getAllUsers();
        return res.json({ users });
    }
    catch (err) {
        return next(err);
    }
});

/**Get one user */
router.get('/:username', async function (req, res, next) {
    try {
        const user = await User.getOneUser(req.params.username);
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
});

/**Add one user */
router.post('/', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.register(req.body);

        const token = createToken(user);
        console.log(user);
        return res.status(201).json({ user, token });
    }
    catch (err) {
        return next(err);
    }
});

/**Update one user */
router.patch('/:username', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.update(req.params.username, req.body);
        return res.status(200).json({ user });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;