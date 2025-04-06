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

const query = `
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS followers CASCADE;
  DROP TABLE IF EXISTS likes CASCADE;
  DROP TABLE IF EXISTS comments CASCADE;
  DROP TABLE IF EXISTS favorites CASCADE;
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

  CREATE TABLE favorites (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      skate_spot_id INT REFERENCES skate_spots(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, skate_spot_id)
  );
`;

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
  return (Math.random() - 0.5) * 0.02;
};

const generateFakeSkateSpot = () => {
  const city = getRandomCity();
  return {
    name: faker.commerce.productName() + " Spot",
    description: faker.lorem.sentence(),
    latitude: city.latitude + getRandomOffset(),
    longitude: city.longitude + getRandomOffset(),
    image_url: faker.image.url(),
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

    // Insert fake users and their profiles
    for (let i = 0; i < NUM_USERS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName });
      const email = faker.internet.email({ firstName, lastName });
      const password = faker.internet.password();
      const bio = "This is a test bio for a fake account. For testing.";
      const location = faker.location.city();
      const profile_picture = faker.image.avatar();
      const age = faker.number.int({ min: 18, max: 45 });

      const userResult = await pool.query(
        `INSERT INTO users (username, email, password) 
         VALUES ($1, $2, $3) RETURNING id`,
        [username, email, password]
      );

      const userId = userResult.rows[0].id;

      await pool.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, bio, age, location, profile_picture) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, firstName, lastName, bio, age, location, profile_picture]
      );

      const skateImages = [
        "https://cdn.jenkemmag.com/mediaAssetsMaster/2017/07/Wallenberg_2.jpg",
        "https://storage.googleapis.com/fsscs1/images/medium/41a9e56ede865686c6517d76d94b97f7.jpg",
        "https://storage.googleapis.com/fsscs1/images/small/ac436d80aa17b62d034027a57183487c.jpg",
        "https://storage.googleapis.com/fsscs1/images/small/e40e0b281f15c27b2e69b165bd118d64.jpg",
        "https://storage.googleapis.com/fsscs1/images/small/af3822824d6e866a5da2554a9f29e271.jpg",
        "https://pbs.twimg.com/media/CW6LQhrWMAAOyzf?format=jpg&name=4096x4096",
        "https://storage.googleapis.com/fsscs1/images/small/dljpq7ijfv7btgr5lk4re1sr4p4qrged.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbLZ5mUBBrPdwjiHQPjr7_3BJ3UR5G9GWD-w&s",
        "https://quartersnacks.com/wp-content/uploads/2011/08/knobbed-manny-pad.jpg",
      ];

      for (let j = 0; j < POSTS_PER_USER; j++) {
        await pool.query(
          `INSERT INTO posts (user_id, content, image_url) 
           VALUES ($1, $2, $3)`,
          [
            userId,
            faker.lorem.sentence(),
            faker.helpers.arrayElement(skateImages),
          ]
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

    // Seed favorites: assign three random skate spots to each user
    const usersResult = await pool.query("SELECT id FROM users");
    const skateSpotsResult = await pool.query("SELECT id FROM skate_spots");
    const userIds = usersResult.rows.map((row) => row.id);
    const skateSpotIds = skateSpotsResult.rows.map((row) => row.id);

    for (const userId of userIds) {
      // Shuffle the skateSpotIds to pick three random spots for this user
      const shuffledSpots = skateSpotIds.sort(() => Math.random() - 0.5);
      const favoritesCount = 3;
      for (let i = 0; i < favoritesCount; i++) {
        await pool.query(
          `INSERT INTO favorites (user_id, skate_spot_id) VALUES ($1, $2)`,
          [userId, shuffledSpots[i]]
        );
      }
    }

    await pool.query("COMMIT");
    console.log(
      "✅ Database seeded successfully with fake users, posts, skate spots, and favorites."
    );
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ Error seeding the database:", err);
  } finally {
    await pool.end();
  }
};

const createTables = async () => {
  try {
    await pool.query(query);
    console.log("✅ Tables dropped and recreated successfully.");
    await seedDatabase();
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    await pool.end();
  }
};

createTables();
