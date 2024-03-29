require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { hashPassword, comparePassword } = require("./auth");

const register = async (req, res) => {
    const { first_name, last_name, email, password, contact, address, role } =
        req.body;
    if (!first_name) {
        return res.json({
            error: "Please provide name",
        });
    }
    if (!password) {
        return res.json({
            error: "Please provide Email",
        });
    }
    if (!role) {
        return res.json({
            error: "Please provide role",
        });
    }
    if (!contact) {
        res.json({
            error: "Please provide contact",
        });
    }
    if (!email) {
        return res.json({
            error: "Please provide email",
        });
    }
    const exist = await User.findOne({ email });
    if (exist) {
        return res.json({
            error: "Email is already taken",
        });
    }
    const newPassword = await hashPassword(password);
    const user = await User.create({
        first_name,
        last_name,
        email,
        password: newPassword,
        contact,
        address,
        role,
    });
    user.password = undefined;
    jwt.sign(
        {
            email: user.email,
            id: user._id,
            name: user.first_name,
            role: user.role,
            address: user.address,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        (err, token) => {
            if (err) {
                throw err;
            }
            return res
                .cookie("token", token, {
                    httpOnly: false,
                    sameSite: "none",
                    secure: true,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })
                .json(user);
        }
    );
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({
            error: "No user found",
        });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
        res.json({
            error: "incorrect password",
        });
    } else {
        jwt.sign(
            {
                email: user.email,
                id: user._id,
                name: user.first_name,
                role: user.role,
                address: user.address,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
            (err, token) => {
                if (err) {
                    throw err;
                }
                user.password = undefined;
                res.cookie("token", token, {
                    httpOnly: false,
                    sameSite: "none",
                    secure: true,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }).json(user);
            }
        );
    }
};

const profile = (req, res) => {
    const { token } = req.cookies || {};
    console.log(req.cookies);
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) {
                throw err;
            }
            res.json(user);
        });
    } else {
        res.json(null);
    }
};

module.exports = { register, login, profile };
