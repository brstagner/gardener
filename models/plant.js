"use strict";

require('dotenv').config();
const { db } = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for users. */

class Plant {
    /**Get all plants from database */
    static async getAllPlants () {
        const res = await db.query(
            `SELECT
                plant_id,
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months
            FROM plants`
        );
        return res.rows;

    };

    /**Get user's plants from database */
    static async getUserPlants (user_id) {
        const res = await db.query(
            `SELECT
                plant_id,
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months
            FROM plants
            WHERE user_id = $1`,
            [user_id]
        );
        return res.rows;

    };

    static async getOnePlant (plant_id) {
        const res = await db.query(
            `SELECT
                plant_id,
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months
            FROM plants
            WHERE plant_id = $1`,
            [plant_id]
        );
        return res.rows[0];
    };

    static async addPlant ({ user_id, common_name, scientific_name, bloom_color, bloom_months }) {

        const res = await db.query(
            `INSERT INTO plants (
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months
                )
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING
                plant_id,
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months`,
            [user_id, common_name, scientific_name, bloom_color, bloom_months]
        );
        return res.rows[0];
    };

    static async update (plant_id, { common_name, scientific_name, bloom_color, bloom_months }) {
        let columns = '';
        let args = [plant_id];
        let counter = 2;
        if (common_name) {
            columns += `common_name = $${counter},`;
            args.push(common_name);
            counter++;
        }
        if (scientific_name) {
            columns += `scientific_name = $${counter},`;
            args.push(scientific_name);
            counter++;
        }
        if (bloom_color) {
            columns += `bloom_color = $${counter},`;
            args.push(bloom_color);
            counter++;
        }
        if (bloom_months) {
            columns += `bloom_months = $${counter},`;
            args.push(bloom_months);
            counter++;
        }
        columns = columns.slice(0, -1);

        const res = await db.query(
            `UPDATE plants
            SET ${columns}
            WHERE plant_id = $1
            RETURNING
                plant_id,
                user_id,
                common_name,
                scientific_name,
                bloom_color,
                bloom_months`,
            args
        );

        return res.rows[0];
    };
};

module.exports = Plant;