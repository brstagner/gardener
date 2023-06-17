// Test Plant models

// connect to test database
process.env.NODE_ENV = "test";

// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');
const { db } = require('../../db');
const Garden = require('../../models/garden');

let user;
let plants;
let plantOne;
let plantTwo;
let gardens;
let gardenOne;
let gardenTwo;

beforeEach(async function () {
    // Add a test user to the database
    let result = await db.query(`
    INSERT INTO users
        (username, password, email, location, is_admin)
    VALUES
        ('u1', 'password', 'user1@email.com', '{"name" : "Utah"}', null)
    RETURNING user_id, username, email, location, is_admin
    `);
    user = result.rows[0];

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

    result = await db.query(
        `INSERT INTO gardens
        (user_id, name, grid)
    VALUES
        (${user.user_id}, 'Garden One', '{{${plantOne.plant_id}, ${plantTwo.plant_id}}, {${plantTwo.plant_id}, ${plantOne.plant_id}}}'),
        (${user.user_id}, 'Garden Two', '{{${plantTwo.plant_id}, ${plantOne.plant_id}}, {${plantOne.plant_id}, ${plantTwo.plant_id}}}')
    RETURNING garden_id, name, grid
    `);

    gardens = result.rows;
    gardenOne = result.rows[0];
    gardenTwo = result.rows[1];
});

afterEach(async function () {
    // delete test data
    await db.query("DELETE FROM gardens");
    await db.query("DELETE FROM plants");
    await db.query("DELETE FROM USERS");
});

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("Garden model", function () {
    test("Gets a list of gardens", async function () {
        const response = await Garden.getAllGardens();
        expect(response).toEqual(
            [{ "user_id": user.user_id, ...gardenOne },
            { "user_id": user.user_id, ...gardenTwo }]
        );
    });

    test("Gets one garden", async function () {
        const response = await Garden.getOneGarden(gardenOne.garden_id);
        expect(response).toEqual({
            "user_id": user.user_id,
            ...gardenOne
        });
    });

    test("Adds a new garden", async function () {
        const gardenThree = {
            "user_id": user.user_id,
            "name": "Garden Three",
            "grid": []
        };
        const response = await Garden.addGarden(gardenThree);
        expect(response).toEqual({
            "garden_id": expect.any(Number),
            ...gardenThree
        });
    });

    test("Updates a garden", async function () {
        const data = {
            "name": "Garden Four",
            "grid": [[1, 2]]
        };
        let response = await Garden.update(gardenOne.garden_id, data);
        expect(response).toEqual({
            "garden_id": gardenOne.garden_id,
            "user_id": user.user_id,
            ...data
        });
    });

    test("Partially updates a garden", async function () {
        const data = {
            "grid": []
        };
        let response = await Garden.update(gardenTwo.garden_id, data);
        expect(response).toEqual({
            "garden_id": gardenTwo.garden_id,
            "user_id": user.user_id,
            "name": "Garden Two",
            "grid": []
        });
    });
});