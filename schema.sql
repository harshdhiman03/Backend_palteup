CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE speakers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  expertise VARCHAR(255),
  price_per_session DECIMAL(10, 2),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  speaker_id INT,
  user_id INT,
  start_time TIME,
  end_time TIME,
  date DATE,
  FOREIGN KEY (speaker_id) REFERENCES speakers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE time_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  speaker_id INT,
  start_time TIME,
  end_time TIME,
  date DATE,
  available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (speaker_id) REFERENCES speakers(id)
);