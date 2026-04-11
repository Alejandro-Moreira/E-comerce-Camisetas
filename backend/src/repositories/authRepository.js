const pool = require('../config/db');

exports.findUserByEmail = async (email) => {
  const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return users[0];
};

exports.findUserById = async (id) => {
  const [users] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return users[0];
};

exports.createUser = async (nombre, email, hashedPassword) => {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol, verificado) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, hashedPassword, 'cliente', 0]
  );
  return result.insertId;
};

exports.saveVerificationToken = async (userId, token) => {
  await pool.query('INSERT INTO email_verification_tokens (usuario_id, token) VALUES (?, ?)', [userId, token]);
};

exports.getVerificationToken = async (token) => {
  const [tokens] = await pool.query('SELECT * FROM email_verification_tokens WHERE token = ?', [token]);
  return tokens[0];
};

exports.deleteVerificationToken = async (id) => {
  await pool.query('DELETE FROM email_verification_tokens WHERE id = ?', [id]);
};

exports.markUserAsVerified = async (userId) => {
  await pool.query('UPDATE usuarios SET verificado = 1 WHERE id = ?', [userId]);
};

exports.savePasswordResetToken = async (userId, token, expiration) => {
  await pool.query('INSERT INTO password_resets (usuario_id, token, expiracion) VALUES (?, ?, ?)', [userId, token, expiration]);
};

exports.getValidPasswordResetToken = async (token) => {
  const [pwdResets] = await pool.query('SELECT * FROM password_resets WHERE token = ? AND expiracion > NOW()', [token]);
  return pwdResets[0];
};

exports.updateUserPassword = async (userId, hashedPassword) => {
  await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);
};

exports.deletePasswordResetToken = async (id) => {
  await pool.query('DELETE FROM password_resets WHERE id = ?', [id]);
};
