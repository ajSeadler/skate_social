const { Pool } = require("pg");
require("dotenv").config();
const { faker } = require("@faker-js/faker");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const NUM_USERS = 10; // Number of fake users
const POSTS_PER_USER = 5; // Number of posts per user
const NUM_SKATE_SPOTS = 50; // Number of fake skate spots

// Helper: Generate random U.S. coordinates
const getRandomUSCoordinates = () => {
  // Approximate bounding box for the contiguous U.S.
  const minLat = 24.396308;
  const maxLat = 49.384358;
  const minLon = -124.848974;
  const maxLon = -66.885444;
  const lat = parseFloat(
    (Math.random() * (maxLat - minLat) + minLat).toFixed(6)
  );
  const lon = parseFloat(
    (Math.random() * (maxLon - minLon) + minLon).toFixed(6)
  );
  return { lat, lon };
};

const createTables = async () => {
  const query = `
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS followers CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS skate_spots CASCADE;

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE user_profiles (
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

    CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE followers (
        id SERIAL PRIMARY KEY,
        follower_id INT REFERENCES users(id) ON DELETE CASCADE,
        followed_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE skate_spots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(9, 6),
        longitude DECIMAL(9, 6),
        image_url TEXT,
        security_level VARCHAR(50),
        obstacles TEXT NOT NULL,
        best_time_of_day TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("✅ Tables dropped and recreated successfully.");
    await seedDatabase();
  } catch (err) {
    console.error("❌ Error dropping and recreating tables:", err);
  } finally {
    await pool.end();
  }
};

// Generate a fake skate spot using faker and our random U.S. coordinate generator
const cities = [
  { name: "OKC", latitude: 35.4676, longitude: -97.5164 },
  { name: "LA", latitude: 34.0522, longitude: -118.2437 },
  { name: "NYC", latitude: 40.7128, longitude: -74.006 },
  { name: "Atlanta", latitude: 33.749, longitude: -84.388 },
  { name: "Louisville", latitude: 38.2527, longitude: -85.7585 },
];

const getRandomCity = () => {
  return cities[Math.floor(Math.random() * cities.length)];
};

const getRandomOffset = () => {
  // A small offset to vary the spot within the city limits (approx 0.01 degrees)
  return (Math.random() - 0.5) * 0.02;
};

const generateFakeSkateSpot = () => {
  const city = getRandomCity();
  return {
    name: faker.commerce.productName() + " Spot",
    description: faker.lorem.sentence(),
    latitude: city.latitude + getRandomOffset(),
    longitude: city.longitude + getRandomOffset(),
    image_url: faker.image.url(), // Generates a random image URL
    security_level: faker.helpers.arrayElement(["low", "medium", "high"]),
    obstacles: faker.lorem.words(3),
    best_time_of_day: faker.helpers.arrayElement([
      "morning",
      "afternoon",
      "evening",
      "night",
    ]),
  };
};

const seedDatabase = async () => {
  try {
    await pool.query("BEGIN");

    // Insert fake users and their posts
    for (let i = 0; i < NUM_USERS; i++) {
      const username = faker.internet.username();
      const email = faker.internet.email();
      const password = faker.internet.password();

      const userResult = await pool.query(
        `INSERT INTO users (username, email, password) 
         VALUES ($1, $2, $3) RETURNING id`,
        [username, email, password]
      );

      const userId = userResult.rows[0].id;

      // Insert fake posts for each user
      for (let j = 0; j < POSTS_PER_USER; j++) {
        await pool.query(
          `INSERT INTO posts (user_id, content, image_url) 
           VALUES ($1, $2, $3)`,
          [userId, faker.lorem.sentence(), faker.image.url()]
        );
      }
    }

    // Insert fake skate spots
    for (let i = 0; i < NUM_SKATE_SPOTS; i++) {
      const spot = generateFakeSkateSpot();
      await pool.query(
        `INSERT INTO skate_spots (name, description, latitude, longitude, image_url, security_level, obstacles, best_time_of_day) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          spot.name,
          spot.description,
          spot.latitude,
          spot.longitude,
          spot.image_url,
          spot.security_level,
          spot.obstacles,
          spot.best_time_of_day,
        ]
      );
    }

    await pool.query("COMMIT");
    console.log(
      "✅ Database seeded successfully with fake users, posts, and random skate spots."
    );
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ Error seeding the database:", err);
  }
};

createTables();
