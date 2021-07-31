const { request, response } = require("express");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User.js");
const Auth = require("../Middleware/Auth.js");

const router = express.Router();

router.route("/users").get(async (request, response) => {
  const users = await User.find();
  response.send(users);
});

//Signup
router.route("/signup").post(async (request, response) => {
  try {
    const { name, surname, password, email, job, skill, contact } =
      request.body;

    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return response.status(409).json({ error: "Email All Ready Exist" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      surname,
      email,
      password: passwordHash,
      job,
      skill,
      contact,
    });
    await user.save();

    response.status(200).json({ message: "User Registered" });
  } catch (error) {
    response.status(500).send({ message: "Server Error" });
  }
});

//Signin
router.route("/signin").post(async (request, response) => {
  try {
    const { email, password } = request.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return response.status(401).send({ message: "Invalid credentials" });
    } else if (
      findUser &&
      (await bcrypt.compare(password, findUser.password))
    ) {
      const genToken = jwt.sign({ id: findUser._id }, process.env.SECRET_KEY);
      console.log(genToken);
      response.cookie("jwtToken", genToken, {
        expires: new Date(new Date().getTime() + 3600 * 1000),
        sameSite: "none",
        httpOnly: false,
        secure: true,
      });
      return response.status(200).json({ message: "Signin Success !" });
    } else {
      return response.status(401).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    response.status(500);
    response.send(err);
  }
});

router
  .route("/edit/:id")
  .get(async (request, response) => {
    try {
      const id = request.params.id;
      const user = await User.findById(id);
      response.status(200).send(user);
    } catch (error) {
      response.status(500).send({ message: "Server Error" });
    }
  })
  .patch(async (request, response) => {
    try {
      const id = request.params.id;
      const { name, surname, email, contact, job, skill } = request.body;
      const user = await User.findById(id);
      if (name) {
        user.name = name;
      }
      if (surname) {
        user.surname = surname;
      }
      if (email) {
        user.email = email;
      }
      if (contact) {
        user.contact = contact;
      }
      if (job) {
        user.job = job;
      }
      if (skill) {
        user.skill = skill;
      }
      await user.save();
      response.status(200).send(user);
    } catch (error) {
      response.status(500).send({ message: "Server Error" });
    }
  })
  .delete(async (request, response) => {
    try {
      const id = request.params.id;
      await User.deleteOne({ _id: id });
      response.status(200).send({ message: "User Deleted" });
    } catch (error) {
      response.status(500).send({ message: "Server Error" });
    }
  });

//Home Page Authorization
router.route("/home").get(Auth, (request, response) => {
  response.send(request.rootUser);
});

module.exports = router;
