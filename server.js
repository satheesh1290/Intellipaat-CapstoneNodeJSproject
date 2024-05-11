const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/userDB")
  .then(() => console.log("Database connected"))
  .catch((error) => console.log(error));

app.get("/signin", function (req, res) {
  res.render("signin.ejs");
});

app.get("/signup", function (req, res) {
  res.render("signup.ejs", { message: "", success: "" });
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then((dbres) => {
      //   return res.status(400).json({ message: "Username already exists" });
      res.render("signup.ejs", {
        message: "Username already exists",
        success: "",
      });
    })
    .catch((err) => console.log("Error in fetching user"));

  if (password.length < 5) {
    // return res
    //   .status(400)
    //   .json({ message: "Password must be at least 5 characters" });
    return res.render("signup.ejs", {
      message: "Password must be at least 5 characters",
      success: "",
    });
  }

  const hashed_pw = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  try {
    const newUser = new User({ username, password: hashed_pw });
    await newUser.save();
    // return res.status(201).json({ message: "User created successfully" });
    return res.render("signup.ejs", {
      message: "",
      success: "User created successfully",
    });
  } catch (err) {
    console.error(err);
    // return res.status(500).json({ message: "Error creating user" });
    return res.render("signup.ejs", {
      message: "Error creating user",
      success: "",
    });
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "Incorrect credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(404).json({ message: "Incorrect credentials" });
  }

  const token = user.id;

  return res.json({ token });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
