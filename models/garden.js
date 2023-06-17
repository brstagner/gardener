"use strict";

require('dotenv').config();
const { db } = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for gardens. */

class Garden {
    /**Get all gardens from database */
    static async getAllGardens () {
        const res = await db.query(
            `SELECT
                garden_id,
                user_id,
                name,
                grid
            FROM gardens`
        );
        return res.rows;

    };

    /**Get user's gardens from database */
    static async getUserGardens (user_id) {
        const res = await db.query(
            `SELECT
                garden_id,
                user_id,
                name,
                grid
            FROM gardens
            WHERE user_id = $1`,
            [user_id]
        );
        return res.rows;

    };

    static async getOneGarden (garden_id) {
        const res = await db.query(
            `SELECT
                garden_id,
                user_id,
                name,
                grid
            FROM gardens
            WHERE garden_id = $1`,
            [garden_id]
        );
        return res.rows[0];
    };

    static async addGarden ({ user_id, name, grid }) {

        const res = await db.query(
            `INSERT INTO gardens (
                user_id,
                name,
                grid
                )
            VALUES
                ($1, $2, $3)
            RETURNING
                garden_id,
                user_id,
                name,
                grid`,
            [user_id, name, grid]
        );
        return res.rows[0];
    };

    static async update (garden_id, { name, grid }) {
        let columns = '';
        let args = [garden_id];
        let counter = 2;
        if (name) {
            columns += `name = $${counter},`;
            args.push(name);
            counter++;
        }
        if (grid) {
            columns += `grid = $${counter},`;
            args.push(grid);
            counter++;
        }
        columns = columns.slice(0, -1);

        const res = await db.query(
            `UPDATE gardens
            SET ${columns}
            WHERE garden_id = $1
            RETURNING
                garden_id,
                user_id,
                name,
                grid`,
            args
        );
        return res.rows[0];
    };
    // static async update (garden_id, { name, grid }) {

    //     const res = await db.query(
    //         `UPDATE gardens
    //         SET name = $2, grid = $3
    //         WHERE garden_id = $1
    //         RETURNING
    //             garden_id,
    //             user_id,
    //             name,
    //             grid`,
    //         [garden_id, name, grid]
    //     );
    //     return res.rows[0];
    // };
};

module.exports = Garden;