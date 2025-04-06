// Add the necessary imports
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

require("dotenv").config();

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
    // Fetch user data from the users table including created_at
    const userResult = await pool.query(
      "SELECT username, email, created_at FROM users WHERE id = $1",
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
    const userData = userResult.rows[0];

    // Combine user and profile data and send it as response
    res.json({ ...userData, ...userProfile });
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
      [userId, content, image_url || null]
    );

    const newPost = postResult.rows[0];
    console.log("Post created:", newPost);
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

// GET route to view all users (GET /users)
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route to view a specific user by id (GET /users/:id)
app.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.email, users.created_at,
              user_profiles.first_name, user_profiles.last_name, 
              user_profiles.profile_picture, user_profiles.bio, 
              user_profiles.location, user_profiles.age
       FROM users 
       LEFT JOIN user_profiles ON users.id = user_profiles.user_id
       WHERE users.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST route to create a new skate spot (POST /skate-spots)
app.post("/skate-spots", verifyToken, async (req, res) => {
  const {
    name,
    description,
    latitude,
    longitude,
    image_url,
    security_level,
    obstacles,
    best_time_of_day,
  } = req.body;
  const userId = req.userId;

  // Validate required fields
  if (!name || !latitude || !longitude || !obstacles || !best_time_of_day) {
    return res.status(400).json({
      error:
        "Name, latitude, longitude, obstacles, and best_time_of_day are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO skate_spots (name, description, latitude, longitude, image_url, security_level, obstacles, best_time_of_day) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, name, description, latitude, longitude, image_url, security_level, obstacles, best_time_of_day, created_at`,
      [
        name,
        description || null,
        latitude,
        longitude,
        image_url || null,
        security_level || null,
        obstacles,
        best_time_of_day,
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

// GET route to fetch all skate spots (GET /skate-spots)
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

// ================= Favorites Endpoints =================

// POST route to add a favorite skate spot (POST /favorites)
app.post("/favorites", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { skate_spot_id } = req.body;

  if (!skate_spot_id) {
    return res.status(400).json({ error: "skate_spot_id is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, skate_spot_id) VALUES ($1, $2) RETURNING id, created_at`,
      [userId, skate_spot_id]
    );
    res
      .status(201)
      .json({ message: "Favorite added", favorite: result.rows[0] });
  } catch (err) {
    console.error("❌ Error adding favorite:", err);
    // Check for unique violation error code
    if (err.code === "23505") {
      return res.status(400).json({ error: "Skate spot already favorited" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE route to remove a favorite (DELETE /favorites/:skate_spot_id)
app.delete("/favorites/:skate_spot_id", verifyToken, async (req, res) => {
  const userId = req.userId;
  const skateSpotId = req.params.skate_spot_id;

  try {
    const result = await pool.query(
      `DELETE FROM favorites WHERE user_id = $1 AND skate_spot_id = $2 RETURNING id`,
      [userId, skateSpotId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Favorite removed" });
  } catch (err) {
    console.error("❌ Error removing favorite:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET route to get all favorite skate spots for the logged-in user (GET /favorites)
app.get("/favorites", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT f.id as favorite_id, s.*
       FROM favorites f
       JOIN skate_spots s ON f.skate_spot_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ favorites: result.rows });
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
