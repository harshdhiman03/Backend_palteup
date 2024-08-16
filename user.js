const db = require('../db');

class User {
  static async createUser(first_name, last_name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.execute('INSERT INTO users SET ?', { first_name, last_name, email, password: hashedPassword });
    return user;
  }

  static async getUserByEmail(email) {
    const user = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return user;
  }
}

module.exports = User;