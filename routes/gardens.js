'use strict';

/** Routes for gardens. */
const { db } = require('../db');
const jsonschema = require('jsonschema');

const express = require('express');
const { isAdmin, isUser } = require('../auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const Garden = require('../models/garden');
const { createToken } = require('../auth');
const gardenNewSchema = require('../schemas/gardenNew.json');
const gardenUpdateSchema = require('../schemas/gardenUpdate.json');

const router = express.Router();

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PATCH");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

/**Get all gardens */
router.get('/all', isAdmin, async function (req, res, next) {
    try {
        const gardens = await Garden.getAllGardens();
        return res.json({ gardens });
    }
    catch (err) {
        return next(err);
    }
});

/**Get user's gardens */
router.post('/collection', async function (req, res, next) {
    // console.log(req.body);
    try {
        const gardens = await Garden.getUserGardens(req.body.user_id);
        return res.json({ gardens });

    }
    catch (err) {
        return next(err);
    }
});

/**Get one garden */
router.get('/:garden_id', async function (req, res, next) {
    try {
        const garden = await Garden.getOneGarden(req.params.garden_id);
        return res.json({ garden });
    }
    catch (err) {
        return next(err);
    }
});

/**Add one garden */
router.post('/', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, gardenNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const garden = await Garden.addGarden(req.body);
        return res.status(201).json({ garden });
    }
    catch (err) {
        return next(err);
    }
});

/**Update one garden */
router.patch('/:garden_id', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, gardenUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const data = req.body;
        console.log(data);
        const garden = await Garden.update(req.params.garden_id, req.body);
        return res.status(200).json({ garden });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;