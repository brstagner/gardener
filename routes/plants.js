'use strict';

/** Routes for plants. */
const { db } = require('../db');
const jsonschema = require('jsonschema');

const express = require('express');
const { isAdmin, isUser } = require('../auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const Plant = require('../models/plant');
const { createToken } = require('../auth');
const plantNewSchema = require('../schemas/plantNew.json');
const plantUpdateSchema = require('../schemas/plantUpdate.json');

const router = express.Router();

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

/**Get all plants */
router.get('/all', async function (req, res, next) {
    try {
        const plants = await Plant.getAllPlants();
        return res.json({ plants });
    }
    catch (err) {
        return next(err);
    }
});

/**Get user's plants */
router.post('/collection', async function (req, res, next) {
    // console.log(req.body);
    try {
        const plants = await Plant.getUserPlants(req.body.user_id);
        return res.json({ plants });

    }
    catch (err) {
        return next(err);
    }
});

/**Get one plant */
router.get('/:plant_id', async function (req, res, next) {
    try {
        const plant = await Plant.getOnePlant(req.params.plant_id);
        return res.json({ plant });
    }
    catch (err) {
        return next(err);
    }
});

/**Add one plant */
router.post('/', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, plantNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const plant = await Plant.addPlant(req.body);
        return res.status(201).json({ plant });
    }
    catch (err) {
        return next(err);
    }
});

/**Update one plant */
router.patch('/:plant_id', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, plantUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const data = req.body;
        console.log(data);
        const plant = await Plant.update(req.params.plant_id, req.body);
        return res.status(200).json({ plant });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;