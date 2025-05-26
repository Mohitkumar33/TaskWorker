const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { sendRegistrationEmail } = require("../utils/mail");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Login or register user via Google
// @access  Public
router.post("/google", async (req, res) => {
  const { tokenId, fcmToken, role, location } = req.body;

  try {
    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Register new user
      user = new User({
        name,
        email,
        role: role || "user",
        profilePhoto: picture,
        googleId,
        fcmToken,
        location: location || {},
        isVerified: false,
      });

      await user.save();
    }

    // Generate your own JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        location: user.location,
        skills: user.skills,
        isVerified: user.isVerified,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ msg: "Invalid Google token" });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  upload.single("profilePhoto"),
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("role", "Role must be either user or provider").isIn([
      "user",
      "provider",
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, skills, fcmToken } = req.body;
    let location;
    if (req.body.location) location = JSON.parse(req.body.location);
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      const profilePhoto = req.file?.path || "";

      user = new User({
        name,
        email,
        password,
        role,
        location,
        profilePhoto,
        skills: role === "provider" && skills ? skills.split(",") : [],
        fcmToken, // save FCM token
      });
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // sendRegistrationEmail(user.email, user.name);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          location: user.location,
          skills: user.skills,
          isVerified: user.isVerified,
          averageRating: user.averageRating,
          totalReviews: user.totalReviews,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET /api/auth/profile/:id
// @desc    Get user profile by ID
// @access  Private
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/auth/profile/:userId
// @desc    Update user profile
// @access  Private
router.put(
  "/profile/:userId",
  authMiddleware,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Allow only the user themselves or an admin to update
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const { name, skills } = req.body;

      // Update name if sent
      if (name) user.name = name;

      // Update skills if user is a provider and skills are provided
      if (skills && user.role === "provider") {
        user.skills = skills.split(",").map((s) => s.trim());
      }

      // Update location if provided as JSON string
      if (req.body.location) {
        try {
          const location = JSON.parse(req.body.location);

          // Only update provided location fields
          user.location = {
            ...user.location,
            ...(location.country && { country: location.country }),
            ...(location.lat !== undefined && { lat: parseFloat(location.lat) }),
            ...(location.lng !== undefined && { lng: parseFloat(location.lng) }),
          };
        } catch (err) {
          return res.status(400).json({ msg: "Invalid location format" });
        }
      }

      // Update profile photo if a new one is uploaded
      if (req.file?.path) {
        user.profilePhoto = req.file.path;
      }

      await user.save();

      res.json({
        msg: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          location: user.location,
          skills: user.skills,
          isVerified: user.isVerified,
          averageRating: user.averageRating,
          totalReviews: user.totalReviews,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password, fcmToken } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user.googleId && !user.password) {
        return res.status(400).json({
          msg: "You registered with Google. Please sign in with Google or set a password.",
        });
      }
      if (!user) return res.status(400).json({ msg: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      // Update token if sent
      console.log(user.fcmToken);
      if (!user.fcmToken || user.fcmToken !== fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email,
          role: user.role,
          fcmToken: user.fcmToken,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
