// Test Plant models

// connect to test database
process.env.NODE_ENV = "test";

// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');
const { db } = require('../../db');
const Plant = require('../../models/plant');

let users;
let user;
let admin;
let plants;
let plantOne;
let plantTwo;

beforeEach(async function () {
    // Add a test user to the database
    let result = await db.query(`
    INSERT INTO users
        (username, password, email, location, is_admin)
    VALUES
        ('u1', 'password', 'user1@email.com', '{"name" : "Utah"}', null),
        ('a1', 'password', 'admin@email.com', '{"name" : "Alabama"}', 'true')
    RETURNING user_id, username, email, location, is_admin
    `);
    users = result.rows;
    user = result.rows[0];
    admin = result.rows[1];

    result = await db.query(
        `INSERT INTO plants
        (user_id, common_name, scientific_name, bloom_color, bloom_months)
    VALUES
        (${user.user_id}, 'Plant One', 'Primum planta', '{"red", "blue"}', '{"jun", "jul", "aug"}'),
        (${user.user_id}, 'Plant Two', 'Secundo planta', '{"green", "white"}', '{"jan", "nov", "dec"}')
    RETURNING plant_id, user_id, common_name, scientific_name, bloom_color, bloom_months
    `);

    plants = result.rows;
    plantOne = result.rows[0];
    plantTwo = result.rows[1];
});

afterEach(async function () {
    // delete test data
    await db.query("DELETE FROM plants");
    await db.query("DELETE FROM USERS");
});

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("Plant model", function () {
    test("Gets a list of plants", async function () {
        const response = await Plant.getAllPlants();
        expect(response).toEqual(
            plants
        );
    });

    test("Gets one plant", async function () {
        const response = await Plant.getOnePlant(plantOne.plant_id);
        expect(response).toEqual(
            plantOne
        );
    });

    test("Adds a new plant", async function () {
        const plantThree = {
            "user_id": user.user_id,
            "common_name": "Plant Three",
            "scientific_name": "Tertia planta",
            "bloom_color": ["yellow", "purple"],
            "bloom_months": ["feb", "mar", "apr"]
        };
        const response = await Plant.addPlant(plantThree);
        expect(response).toEqual({
            "plant_id": expect.any(Number),
            "user_id": user.user_id,
            "common_name": "Plant Three",
            "scientific_name": "Tertia planta",
            "bloom_color": ["yellow", "purple"],
            "bloom_months": ["feb", "mar", "apr"]
        });
    });

    test("Updates a plant", async function () {
        const data = {
            "common_name": "Plant Four",
            "scientific_name": "Quartus planta",
            "bloom_color": ["silver", "gold"],
            "bloom_months": ["may"]
        };
        let response = await Plant.update(plantOne.plant_id, data);
        expect(response).toEqual({
            "plant_id": expect.any(Number),
            "user_id": user.user_id,
            "common_name": "Plant Four",
            "scientific_name": "Quartus planta",
            "bloom_color": ["silver", "gold"],
            "bloom_months": ["may"]
        });
    });

    test("Partially updates a plant", async function () {
        const data = {
            "common_name": "Plant Five"
        };
        let response = await Plant.update(plantTwo.plant_id, data);
        expect(response).toEqual({
            "plant_id": expect.any(Number),
            "user_id": user.user_id,
            "common_name": "Plant Five",
            "scientific_name": "Secundo planta",
            "bloom_color": ["green", "white"],
            "bloom_months": ['jan', 'nov', 'dec']
        });
    });
});