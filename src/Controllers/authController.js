const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/userRegisterModel");

// USER REGISTER (enhanced with password hashing)
const userRegister = async function (req, res) {
  try {
    let data = req.body;
    if (!data) return res.status(400).send({ status: false, message: "please enter all fields..." });

    let { name, email, password, confirmpassword, dateOfBirth, hobbies, bio, gender, interestedIn, interests, photos } = data;

    if (!name) return res.status(400).send({ status: false, message: "name is required" });
    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!password) return res.status(400).send({ status: false, message: "password is required" });
    if (!confirmpassword) return res.status(400).send({ status: false, message: "confirm password is required" });
    if (password !== confirmpassword) return res.status(400).send({ status: false, message: "password mismatch" });
    if (!dateOfBirth) return res.status(400).send({ status: false, message: "date of birth is required" });
    if (!hobbies || hobbies.length === 0) return res.status(400).send({ status: false, message: "hobbies are required" });
    if (!bio) return res.status(400).send({ status: false, message: "bio is required" });

    let exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).send({ status: false, message: "email already registered" });

    // Calculate age from DOB
    let dob = new Date(dateOfBirth);
    let age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) return res.status(400).send({ status: false, message: "must be 18 or older" });

    let hashed = await bcrypt.hash(password, 10);

    let user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      dateOfBirth: dob,
      age,
      hobbies: Array.isArray(hobbies) ? hobbies : hobbies.split(",").map(h => h.trim()),
      interests: interests ? (Array.isArray(interests) ? interests : interests.split(",").map(i => i.trim())) : [],
      bio: bio.trim(),
      gender: gender || "",
      interestedIn: interestedIn || "everyone",
      photos: photos || [],
      isregistered: true,
      role: "user",
      status: "Active"
    });

    let token = jwt.sign(
      { userId: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).send({
      status: true,
      message: "registration successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          bio: user.bio,
          hobbies: user.hobbies,
          interests: user.interests,
          photos: user.photos
        }
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// USER LOGIN
const userLogin = async function (req, res) {
  try {
    let { email, password } = req.body;
    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!password) return res.status(400).send({ status: false, message: "password is required" });

    let user = await User.findOne({ email: email.toLowerCase(), role: "user" });
    if (!user) return res.status(401).send({ status: false, message: "invalid credentials" });

    if (user.status === "Banned") return res.status(403).send({ status: false, message: "account banned" });
    if (user.status === "Suspended") return res.status(403).send({ status: false, message: "account suspended" });

    let ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).send({ status: false, message: "invalid credentials" });

    // Update last active
    user.lastActiveAt = new Date();
    await user.save();

    let token = jwt.sign(
      { userId: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).send({
      status: true,
      message: "login success",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          bio: user.bio,
          hobbies: user.hobbies,
          interests: user.interests,
          photos: user.photos,
          activeVenueId: user.activeVenueId
        }
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET MY PROFILE (user)
const getMyProfile = async function (req, res) {
  try {
    let user = await User.findById(req.user.userId)
      .select("-password -swipedRight -swipedLeft -blockedUsers")
      .populate("activeVenueId", "name type city");

    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    return res.status(200).send({ status: true, message: "profile", data: user });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// UPDATE MY PROFILE
const updateMyProfile = async function (req, res) {
  try {
    const allowed = ["name", "bio", "hobbies", "interests", "gender", "interestedIn", "photos", "privacySettings"];
    const updates = {};
    for (let key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    let user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
      .select("-password -swipedRight -swipedLeft -blockedUsers");

    if (!user) return res.status(404).send({ status: false, message: "user not found" });

    return res.status(200).send({ status: true, message: "profile updated", data: user });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { userRegister, userLogin, getMyProfile, updateMyProfile };
