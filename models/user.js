
"use strict";

require('dotenv').config();
const { db } = require("../db");
const bcrypt = require("bcrypt");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const BCRYPT_WORK_FACTOR = +(process.env.BCRYPT_WORK_FACTOR);

// override parser to return numeric types as floats
const types = require('pg').types;
types.setTypeParser(1700, function (val) {
    return parseFloat(val);
});

/** Related functions for users. */

class User {
    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/

    static async authenticate (username, password) {
        // try to find the user first
        const result = await db.query(
            `SELECT username,
                    user_id,
                    password,
                    is_admin
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            };
        };
        throw new UnauthorizedError("Invalid username/password");
    };

    static async getAllUsers () {
        const res = await db.query(
            `SELECT user_id, username, email, location, is_admin
            FROM users`
        );
        return res.rows;
    };

    static async getOneUser (username) {
        const res = await db.query(
            `SELECT user_id, username, email, location, is_admin
            FROM users
            WHERE username = $1`,
            [username]
        );
        return res.rows[0];
    };

    static async register ({ username, password, email, location, is_admin = false }) {

        // check for duplicate username
        const duplicate = await db.query(
            `SELECT username
           FROM users
           WHERE username = $1`,
            [username],
        );

        if (duplicate.rows[0]) {
            throw new BadRequestError(`Username "${username}" is taken`);
        }

        const hash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const res = await db.query(
            `INSERT INTO users
                (username, password, email, location, is_admin)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING
                user_id, username, email, location, is_admin`,
            [username, hash, email, location, is_admin]
        );

        const userId = await db.query(
            `SELECT user_id
            FROM users
            WHERE username = $1`,
            [username]
        );
        console.log({ ...res.rows[0], ...userId.rows[0] });
        return { ...res.rows[0], ...userId.rows[0] };
    };

    static async update (username, { newUsername, password, email, location, is_admin }) {
        // check for duplicate username
        if (username !== newUsername) {
            const duplicate = await db.query(
                `SELECT username
           FROM users
           WHERE username = $1`,
                [newUsername],
            );

            if (duplicate.rows[0]) {
                throw new BadRequestError(`Username "${newUsername}" is taken`);
            }
        }

        let columns = '';
        let args = [username];
        let counter = 2;
        if (newUsername) {
            columns += `username = $${counter},`;
            args.push(newUsername);
            counter++;
        }
        if (password) {
            columns += `password = $${counter},`;
            args.push(password);
            counter++;
        }
        if (email) {
            columns += `email = $${counter},`;
            args.push(email);
            counter++;
        }
        if (location) {
            columns += `location = $${counter},`;
            args.push(location);
            counter++;
        }
        if (is_admin) {
            columns += `is_admin = $${counter},`;
            args.push(is_admin);
            counter++;
        }
        columns = columns.slice(0, -1);

        // let query = `UPDATE users
        //     SET ${columns}
        //     WHERE username = $1
        //     RETURNING user_id, username, email, location,
        //     [${args}]`;

        // console.log(query);

        const res = await db.query(
            `UPDATE users
            SET ${columns}
            WHERE username = $1
            RETURNING user_id, username, email, location, is_admin`,
            args
        );

        return res.rows[0];
    };
};

module.exports = User;