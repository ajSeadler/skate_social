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
    DROP TABLE IF EXISTS skate_spots CASCADE;

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
    CREATE TABLE IF NOT EXISTS skate_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    image_url TEXT, -- Added image column
    security_level VARCHAR(50), -- Added security level with a default
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

const seedData = {
  users: [
    {
      username: "ajskates",
      email: "Aj@a.com",
      password: "password",
    },
  ],
  posts: [
    {
      user_id: 1,
      content: "This is a default post!",
    },
  ],
  skate_spots: [
    {
      name: "Twin Creek Ditch",
      description: "A cool DIY spot with a ton of community support",
      latitude: 35.44621,
      longitude: -97.55712,
      image_url:
        "https://www.skatedeluxe.com/blog/wp-content/uploads/2018/09/obsctacle-guide-curb.jpg", // Add image URL
      security_level: "low", // Add security level
    },
    {
      name: "Butter Ledge",
      description: "A ledge in Military Park in the Asian District",
      latitude: 35.49465,
      longitude: -97.53247,
      image_url:
        "https://www.skatedeluxe.com/blog/wp-content/uploads/2018/09/obsctacle-guide-curb.jpg",
      security_level: "low",
    },
    {
      name: "Round Flat Bar",
      description:
        "Round flat bar starting in a parking lot, leading into the sidewalk",
      latitude: 35.46798,
      longitude: -97.52311,
      image_url:
        "https://www.skatedeluxe.com/blog/wp-content/uploads/2018/09/obsctacle-guide-curb.jpg",
      security_level: "medium",
    },
    {
      name: "Long Flat Bar",
      description:
        "A long, but short in height, round flat bar in a parking lot. Outside of business hours only",
      latitude: 35.4838,
      longitude: -97.51575,
      image_url:
        "https://www.skatedeluxe.com/blog/wp-content/uploads/2018/09/obsctacle-guide-curb.jpg",
      security_level: "medium",
    },
    {
      name: "Ledge On Sidewalk",
      description: "A staircase pressed up against building used as a ledge.",
      latitude: 35.47614,
      longitude: -97.51387,
      image_url:
        "https://www.skatedeluxe.com/blog/wp-content/uploads/2018/09/obsctacle-guide-curb.jpg",
      security_level: "low",
    },
  ],
};

const seedDatabase = async () => {
  try {
    await pool.query("BEGIN"); // Start a transaction

    // Seed users
    for (let user of seedData.users) {
      const userResult = await pool.query(
        `INSERT INTO users (username, email, password) 
         VALUES ($1, $2, $3) RETURNING id`,
        [user.username, user.email, user.password]
      );
      const userId = userResult.rows[0].id;

      // Insert posts linked to the user
      for (let post of seedData.posts) {
        await pool.query(
          `INSERT INTO posts (user_id, content) 
           VALUES ($1, $2)`,
          [userId, post.content]
        );
      }

      // Insert skate spots linked to the user
      for (let spot of seedData.skate_spots) {
        await pool.query(
          `INSERT INTO skate_spots (name, description, latitude, longitude, image_url, security_level) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            spot.name,
            spot.description,
            spot.latitude,
            spot.longitude,
            spot.image_url,
            spot.security_level,
          ]
        );
      }
    }

    await pool.query("COMMIT"); // Commit transaction
    console.log("✅ Database seeded successfully with default data.");
  } catch (err) {
    await pool.query("ROLLBACK"); // Rollback transaction if any error
    console.error("❌ Error seeding the database:", err);
  }
};

createTables();
