const bcrypt = require('bcryptjs');
const db = require('./db');
const crypto = require('crypto');

async function createAdmin() {
  const email = 'ridley17@hotmail.fr';
  const password = 'admin';
  const role = 'admin';
  const id = crypto.randomUUID();

  // Custom permissions object
  const permissions = {
    all: true,
    manage_gallery: true,
    manage_flash: true,
    manage_bookings: true,
    manage_blog: true,
    manage_users: true
  };

  try {
    console.log(`Hashing password for ${email}...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Inserting into database...');
    const sql = `
      INSERT INTO profiles (id, email, full_name, password_hash, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [id, email, 'Admin Name', passwordHash, role, JSON.stringify(permissions)]);

    console.log('-----------------------------------');
    console.log('Utilisateur créé avec succès !');
    console.log(`ID: ${id}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (Haché: ${passwordHash.substring(0, 15)}...)`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Erreur : Cet email existe déjà dans la base de données.');
    } else {
      console.error('Erreur lors de la création de l\'utilisateur :', err);
    }
    process.exit(1);
  }
}

createAdmin();
