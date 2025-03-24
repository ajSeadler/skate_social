// Add the necessary imports
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Expect the token in the Authorization header (e.g., 'Bearer <token>')

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach the userId to the request object
    next();
  } catch (err) {
    console.error("❌ Invalid token", err);
    res.status(400).json({ error: "Invalid token" });
  }
};

// Register route (POST /register)
app.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    bio,
    age,
    location,
    profile_picture,
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into users table
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [username, email, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Insert profile into user_profiles table
    await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, bio, age, location, profile_picture) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, first_name, last_name, bio, age, location, profile_picture]
    );

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1w" });

    res.json({ message: "User registered successfully", token });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route (POST /login)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1w",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Error logging in user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Profile route (GET /profile)
app.get("/profile", verifyToken, async (req, res) => {
  const userId = req.userId; // The userId is available here due to the middleware

  try {
    // Fetch user data from the users table
    const userResult = await pool.query(
      "SELECT username, email FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // Fetch user profile data from user_profiles table
    const profileResult = await pool.query(
      "SELECT first_name, last_name, bio, age, location, profile_picture FROM user_profiles WHERE user_id = $1",
      [userId]
    );
    if (profileResult.rows.length === 0) {
      return res.status(400).json({ error: "Profile not found" });
    }

    const userProfile = profileResult.rows[0];
    res.json({ ...userResult.rows[0], ...userProfile }); // Combine user and profile data and send it as response
  } catch (err) {
    console.error("❌ Error fetching user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to create a new post (POST /posts)
app.post("/posts", verifyToken, async (req, res) => {
  console.log("Incoming request body:", req.body); // Log the incoming body
  console.log("User ID from token:", req.userId); // Log the decoded user ID

  const { content, image_url } = req.body;
  const userId = req.userId;

  if (!content) {
    return res.status(400).json({ error: "Content cannot be empty" });
  }

  try {
    const postResult = await pool.query(
      `INSERT INTO posts (user_id, content, image_url) 
       VALUES ($1, $2, $3) RETURNING id, content, image_url, created_at`,
      [userId, content, image_url || null] // Use null if no image URL is provided
    );

    const newPost = postResult.rows[0];
    console.log("Post created:", newPost); // Log the newly created post
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET route to view all posts made by the logged-in user (GET /my-posts)
// GET route to view all posts made by the logged-in user (GET /my-posts)
app.get("/my-posts", verifyToken, async (req, res) => {
  const userId = req.userId; // Extract userId from token

  try {
    const userPostsResult = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at, u.username 
       FROM posts p
       JOIN users u ON p.user_id = u.id 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const userPosts = userPostsResult.rows;

    if (userPosts.length === 0) {
      return res
        .status(404)
        .json({ message: "You have not made any posts yet" });
    }

    res.json({ posts: userPosts });
  } catch (err) {
    console.error("❌ Error fetching user's posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET route to view all posts (GET /posts)
app.get("/posts", async (req, res) => {
  try {
    // Fetch all posts along with user information (e.g., username)
    const postsResult = await pool.query(
      `SELECT p.id, p.content, p.image_url, p.created_at, u.username 
       FROM posts p
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC`
    );

    const posts = postsResult.rows;
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    res.json({ posts });
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/skate-spots", verifyToken, async (req, res) => {
  const { name, description, latitude, longitude, image_url, security_level } =
    req.body;
  const userId = req.userId;

  if (!name || !latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Name, latitude, and longitude are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO skate_spots (name, description, latitude, longitude, image_url, security_level) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, description, latitude, longitude, image_url, security_level, created_at`,
      [
        name,
        description || null,
        latitude,
        longitude,
        image_url || null,
        security_level || null,
      ]
    );

    const newSpot = result.rows[0];
    res
      .status(201)
      .json({ message: "Skate spot created successfully", spot: newSpot });
  } catch (err) {
    console.error("❌ Error creating skate spot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all skate spots (GET /skate-spots)
app.get("/skate-spots", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM skate_spots ORDER BY created_at DESC"
    );
    const spots = result.rows;

    if (spots.length === 0) {
      return res.status(404).json({ message: "No skate spots found" });
    }

    res.json({ spots });
  } catch (err) {
    console.error("❌ Error fetching skate spots:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
