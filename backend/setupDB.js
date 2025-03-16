const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Ensure you include this
  port: process.env.DB_PORT,
});

const createTables = async () => {
  const query = `
    -- Drop tables if they exist
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS followers CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- Create Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create User Profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        bio TEXT,
        age INT,
        location VARCHAR(255),
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Posts table
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        image_url TEXT,  -- If users can upload images
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Comments table
    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Likes table
    CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE, -- For liking posts
        comment_id INT REFERENCES comments(id) ON DELETE CASCADE, -- For liking comments (optional)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Followers table
    CREATE TABLE IF NOT EXISTS followers (
        id SERIAL PRIMARY KEY,
        follower_id INT REFERENCES users(id) ON DELETE CASCADE,
        followed_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Messages table
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE -- To mark whether a message has been read
    );
  `;

  try {
    await pool.query(query);
    console.log("✅ Tables dropped and recreated successfully.");
    await seedDatabase(); // Call the function after creating tables
  } catch (err) {
    console.error("❌ Error dropping and recreating tables:", err);
  } finally {
    await pool.end();
  }
};

// Function to seed the database with a default user and post
const seedDatabase = async () => {
  try {
    await pool.query("BEGIN"); // Start a transaction

    // Insert default user
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) RETURNING id`,
      ["defaultUser", "default@example.com", "hashedpassword123"]
    );
    const userId = userResult.rows[0].id;

    // Insert default post linked to the user
    await pool.query(
      `INSERT INTO posts (user_id, content) 
       VALUES ($1, $2)`,
      [userId, "This is a default post!"]
    );

    await pool.query("COMMIT"); // Commit transaction
    console.log("✅ Default user and post created successfully.");
  } catch (err) {
    await pool.query("ROLLBACK"); // Rollback transaction if any error
    console.error("❌ Error seeding the database:", err);
  }
};

createTables();
