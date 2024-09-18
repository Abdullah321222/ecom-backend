// const mongoose = require('mongoose')
const { model, Schema } = require("mongoose");

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: Number,
})

const userModel = model("user", userSchema)
module.exports = { userModel } 
