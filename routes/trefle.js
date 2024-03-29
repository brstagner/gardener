const express = require('express');
const axios = require('axios');
const router = express.Router();

router.use(express.json());

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

router.post("/test", async (req, res, next) => {
    console.log('it works');
});

router.post("/search", async (req, res, next) => {

    let urlString = 'https://trefle.io/api/v1/plants/';

    if (req.body.name) {
        urlString += `search?q=${req.body.name}&`;
    }
    else {
        urlString += `?`;
    }

    if (req.body.color) urlString += `filter[flower_color]=${req.body.color}&`;

    if (req.body.months.length) urlString += `filter[bloom_months]=${req.body.months}&`;

    urlString += `token=${process.env.TREFLE_TOKEN}`;

    console.log(urlString);

    try {
        const response = await axios.get(urlString);
        return res.json(response.data);
    }
    catch (err) {
        next(err);
    }
});

router.post("/page", async (req, res, next) => {
    try {
        const response = await axios.get(
            `https://trefle.io${req.body.link}&token=${process.env.TREFLE_TOKEN}`
        );
        console.log(response);
        return res.json(response.data);
    }
    catch (err) {
        next(err);
    }
});


router.post("/species", async (req, res, next) => {
    try {
        const response = await axios.get(
            `https://trefle.io/api/v1/species/${req.body.species_id}?token=${process.env.TREFLE_TOKEN}`
        );
        console.log(response.data.data);

        return res.json(response.data);
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;
