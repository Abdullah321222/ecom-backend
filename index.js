const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = parseInt(5000) || 7000;
const { userModel } = require('./models/userSchema');
const { mongoose } = require('mongoose');
const bcrypt = require('bcrypt')

app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(bodyParser.json())
app.use(express.json())

app.post("/register", async (req, res) => {
    // console.log(req.body);
    // const email = req.body.email
    const { name, email, password } = req.body;
    // user.findOne({ email }, (err, user) => {
    //     if (user) {
    //         if (password === user.password) {
    //             res.send({ message: "Login Succesful", user: user })
    //         } else {
    //             res.send({ message: "Password did not match" })
    //         }
    //         res.send({ message: "User is already registered" })
    //     }
    // })
    const salt = await bcrypt.genSalt(13);
    const bcryptPassword = await bcrypt.hash(password, salt);
    const newUser = await userModel({
        name: name,
        email: email,
        password: bcryptPassword
    })
    await newUser.save()
    res.status(200).json({ msg: "User Registered Succesfully!" })
})
app.post("/login", async (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body
    const userFound = await userModel.findOne({ email })
    // user.findOne({ email }, (err, user) => {
    //     if (user) {
    //         if (password === user.password) {
    //             res.send({ message: "Login Succesful", user: user })
    //         } else {
    //             res.send({ message: "Password did not match" })
    //         }
    //         res.send({ message: "User is already registered" })
    //     }
    // })
    if (!userFound) {
        console.log("Not Found");
        res.status(500).json({ err: "No User found!" })
    }
    else {
        // console.log(userFound.password);
        const unHashedPassword = await bcrypt.compare(req.body.password, userFound.password)
        // console.log(unHashedPassword);
        if (unHashedPassword) {
            res.status(200).json({ msg: "User Logged in Successfully!", data: true })
        }
        else {
            res.status(500).json({ err: "Invalid Credentials!" })
        }
    }
})

app.post("/forgot-password", async (req, res) => {
    try {
        const userFound = await userModel.findOne({ email: req.body.email })
        // console.log(userFound);
        if (!userFound) {
            console.log("No user Found");
            res.status(404).json({ err: "Invalid Email!" })
            return
        }
        const otp = Math.ceil(100000 + Math.random() * 900000);
        const result = await userModel.updateOne({ otp: otp })
        if (result.modifiedCount === 1) {
            res.status(200).json({ msg: "User Found" })
            return
        }
    } catch (error) {
        console.log(error.toString());
        res.status(500).json({ err: "Invalid Email!" })

    }
})
app.post("/verify-otp", async (req, res) => {
    // console.log(req.body);
    try {
        const userFound = await userModel.findOne({ email: req.body.email })
        if (userFound) {
            if (userFound.otp === Number(req.body.otp)) {
                userFound.otp = null;
                await userFound.save()
                res.status(200).json({ "msg": "Otp matched!" })
                return;
            }
            console.log("Invalid Otp");
        } 
        

    } catch (error) {
        console.log(error.toString());
        res.status(500).json({ err: "Invalid Email!" })

    }
})

mongoose.connect("mongodb://0.0.0.0:27017/Practice")
app.listen(PORT, (error) => {
    if (error) {
        console.log("Error in Starting server");
        return
    }
    console.log('Server started on Port : ', PORT)
})
