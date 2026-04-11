const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const authRepository = require('../repositories/authRepository');
const { enviarCorreo } = require('../utils/mailer');
const AppError = require('../utils/AppError');

exports.registerUser = async (nombre, email, password) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError('EMAIL_EXISTS', 'El email ya está registrado', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = await authRepository.createUser(nombre, email, hashedPassword);
  
  const tokenVerificacion = randomUUID();
  await authRepository.saveVerificationToken(userId, tokenVerificacion);

  const verificationLink = `http://localhost:5173/verify-email?token=${tokenVerificacion}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
      <h2>¡Bienvenido, ${nombre}! 👕</h2>
      <p>Verifica tu cuenta de forma segura:</p>
      <a href="${verificationLink}" style="padding:12px 24px; background:#9333ea; color:white; text-decoration:none; border-radius:8px; display:inline-block; font-weight: bold;">Verificar mi Cuenta</a>
    </div>
  `;
  await enviarCorreo(email, 'Confirma tu cuenta', emailHtml).catch(console.error);

  return userId;
};

const pool = require('../config/db');

exports.loginUser = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new AppError('INVALID_CREDENTIALS', 'Correo o contraseña incorrectos', 401);
  if (user.verificado === 0) throw new AppError('USER_NOT_VERIFIED', 'Debes verificar tu correo', 403);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new AppError('INVALID_CREDENTIALS', 'Correo o contraseña incorrectos', 401);

  // Access Token (Corto: 15m)
  const token = jwt.sign(
    { id: user.id, rol: user.rol, email: user.email, nombre: user.nombre, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh Token (Largo: 7d)
  const refreshToken = jwt.sign(
    { id: user.id, rol: user.rol, email: user.email, nombre: user.nombre, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const expiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await pool.execute('INSERT INTO refresh_tokens (usuario_id, token, expiracion) VALUES (?, ?, ?)', [user.id, refreshToken, expiracion]);

  return {
    token, // deprecated compat o access primario
    accessToken: token,
    refreshToken,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
  };
};

exports.refreshAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new AppError('INVALID_TOKEN_TYPE', 'El token provisto no es un Refresh Token válido', 401);
    }
    
    // Valiar token desde DB (evitar hijacks paralelos anulados)
    const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ? AND revocado = 0', [token]);
    if (rows.length === 0) throw new AppError('INVALID_REFRESH_TOKEN', 'Token revocado o inexistente.', 401);

    // Invalida el anterior
    await pool.execute('UPDATE refresh_tokens SET revocado = 1 WHERE id = ?', [rows[0].id]);

    // Generar un nuevo Access Token Corto
    const newAccessToken = jwt.sign(
      { id: decoded.id, rol: decoded.rol, email: decoded.email, nombre: decoded.nombre, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Generar un nuevo Refresh Token y guardarlo
    const newRefreshToken = jwt.sign(
      { id: decoded.id, rol: decoded.rol, email: decoded.email, nombre: decoded.nombre, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const expiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute('INSERT INTO refresh_tokens (usuario_id, token, expiracion) VALUES (?, ?, ?)', [decoded.id, newRefreshToken, expiracion]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch(err) {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Tu sesión ha expirado firmemente. Por favor, inicia sesión nuevamente.', 401);
  }
};

exports.verifyEmailToken = async (token) => {
  const verificacion = await authRepository.getVerificationToken(token);
  if (!verificacion) {
    throw new AppError('INVALID_TOKEN', 'El enlace de validación es inválido o expiró', 400);
  }

  await authRepository.markUserAsVerified(verificacion.usuario_id);
  await authRepository.deleteVerificationToken(verificacion.id);
  return true;
};

exports.requestPasswordReset = async (email) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'El correo provisto no existe en nuestro sistema', 404);
  }

  const resetToken = randomUUID();
  const expiration = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' ');

  await authRepository.savePasswordResetToken(user.id, resetToken, expiration);

  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
      <h2>Recuperación de Contraseña 🔒</h2>
      <p>Hola ${user.nombre}, solicitaste restablecer tu clave. Clic abajo:</p>
      <a href="${resetLink}" style="padding:12px 24px; background:#e11d48; color:white; text-decoration:none; border-radius:8px; display:inline-block; font-weight: bold;">Cambiar contraseña</a>
    </div>
  `;
  await enviarCorreo(email, 'Restablece tu Clave', emailHtml).catch(console.error);
  return true;
};

exports.resetUserPassword = async (token, newPassword) => {
  const resetObj = await authRepository.getValidPasswordResetToken(token);
  if (!resetObj) {
    throw new AppError('INVALID_TOKEN', 'El token temporal para regenerar credenciales es inválido', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);

  await authRepository.updateUserPassword(resetObj.usuario_id, hashed);
  await authRepository.deletePasswordResetToken(resetObj.id);
  return true;
};
