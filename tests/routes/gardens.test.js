// Test Gardens routes

// connect to test database
process.env.NODE_ENV = "test";

// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');
const { db } = require('../../db');
const { createToken } = require('../../auth');

let user;
let gardens;
let gardenOne;
let gardenTwo;

const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImExIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjgzMzc4MzI1fQ.TCLE-SD_0ZN9DFzj_AbdIs4kRET2EMStYnwL5Mrxcp0";
const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InUxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY4MzM3ODMyNX0.jwPf7AaIbrHbXq1djzQnAmrTFJFX58qW8vLeBi8dME4";
const wrongUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InUyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY4MzM3ODMyNX0.NzFdUO2NBDFfQng0K2b3ZmAczU4kCsvdKIxeQC7Tbzs";

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
        `INSERT INTO gardens
        (user_id, name, grid)
    VALUES
        (${user.user_id}, 'Garden One', '{{1, 2}, {2, 1}}'),
        (${user.user_id}, 'Garden Two', '{{2, 1}, {1, 2}}')
    RETURNING garden_id, user_id, name, grid
    `);

    gardens = result.rows;
    gardenOne = result.rows[0];
    gardenTwo = result.rows[1];
});

afterEach(async function () {
    // delete test data
    await db.query("DELETE FROM gardens");
    await db.query("DELETE FROM plants");
    await db.query("DELETE FROM users");
});

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("GET /gardens/all", function () {
    test("Gets a list of gardens", async function () {
        const response = await request(app).get(`/gardens/all`).set('authorization', adminToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            gardens: gardens
        });
    });
    // test("Unauthorized for non-admin", async function () {
    //     const response = await request(app).get(`/gardens/all`).set('authorization', userToken);
    //     expect(response.statusCode).toEqual(401);
    // });
});

describe("GET /gardens/:garden_id", function () {
    test("Gets one user", async function () {
        const response = await request(app).get(`/gardens/${gardenOne.garden_id}`).set('authorization', userToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            garden: gardenOne
        });
    });
    // test("Unauthorized for wrong user", async function () {
    //     const response = await request(app).get(`/plants/${gardenTwo.garden_id}`).set('authorization', wrongUserToken);
    //     expect(response.statusCode).toEqual(401);
    // });
});

describe("POST /garden", function () {
    test("Adds a new garden", async function () {
        const gardenThree = {
            "user_id": user.user_id,
            "name": "Garden Three",
            "grid": []
        };
        const response = (await request(app)
            .post(`/gardens`)
            .send({ "user_id": user.user_id, ...gardenThree }));
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            garden: {
                "garden_id": expect.any(Number),
                "user_id": user.user_id,
                ...gardenThree
            }
        });
    });
});

describe("PATCH /gardens/:garden_id", function () {
    const data = {
        "name": "Garden Four",
        "grid": [[1, 2]]
    };
    test("Patches a garden", async function () {
        const response = (await request(app)
            .patch(`/gardens/${gardenOne.garden_id}`)
            .set('authorization', userToken)
            .send(data));
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            garden: {
                "garden_id": gardenOne.garden_id,
                "user_id": user.user_id,
                ...data
            }
        });
    });
    test("Partially patches a garden", async function () {
        const response = (await request(app)
            .patch(`/gardens/${gardenTwo.garden_id}`)
            .set('authorization', userToken)
            .send({ "grid": [] }));
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            garden: {
                "garden_id": gardenTwo.garden_id,
                "user_id": user.user_id,
                "name": "Garden Two",
                "grid": []
            }
        });
    });
    // test("Unauthorized for wrong user", async function () {
    //     const response = await request(app).patch(`/gardens/${gardenTwo.garden_id}`).set('authorization', wrongUserToken).send({ "name": "gardenFour" });
    //     expect(response.statusCode).toEqual(401);
    // });
});