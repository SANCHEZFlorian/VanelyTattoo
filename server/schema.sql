CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  permissions JSON,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  button_text VARCHAR(100),
  button_link TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  publish_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  views INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  client_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  booking_date DATE,
  booking_time TIME,
  booking_end_time TIME,
  project_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  reference_image TEXT,
  size VARCHAR(100),
  placement VARCHAR(100),
  budget VARCHAR(100),
  processed_for_gallery BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS booking_exceptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exception_date DATE NOT NULL,
  exception_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT
);

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flash_tattoos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(255) NOT NULL,
  categories JSON,
  size VARCHAR(100),
  color JSON,
  price INT,
  original_price INT,
  discount INT DEFAULT 0,
  description TEXT,
  images JSON,
  status VARCHAR(50) DEFAULT 'active',
  views INT DEFAULT 0,
  duration INT DEFAULT 60
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(255) NOT NULL,
  images JSON,
  categories JSON,
  status VARCHAR(50) DEFAULT 'active',
  views INT DEFAULT 0,
  description TEXT,
  flash_id INT
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_type VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  user_id VARCHAR(36),
  details JSON,
  status VARCHAR(50) DEFAULT 'success'
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  from_name VARCHAR(255),
  email VARCHAR(255),
  subject VARCHAR(255),
  message_body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  phone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  discount_percent INT NOT NULL,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT FALSE,
  is_global BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(255),
  content TEXT,
  color VARCHAR(50) DEFAULT 'bg-yellow-200',
  is_done BOOLEAN DEFAULT FALSE,
  event_date DATE,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  flash_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (flash_id) REFERENCES flash_tattoos(id) ON DELETE CASCADE
);
