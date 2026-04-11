const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      throw new AppError('MISSING_FIELDS', 'Campos requeridos', 400);
    }
    const userId = await authService.registerUser(nombre, email, password);
    successResponse(res, { userId }, 'Usuario registrado. Revisa tu correo.', 201);
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Error interno del servidor');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('MISSING_FIELDS', 'Email y contraseña requeridos', 400);
    }
    const loginData = await authService.loginUser(email, password);
    successResponse(res, loginData, 'Login exitoso');
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Error interno del servidor');
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('MISSING_FIELDS', 'Refresh token requerido', 400);
    }
    const tokenData = await authService.refreshAccessToken(refreshToken);
    successResponse(res, tokenData, 'Token refrescado exitosamente');
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Error verificando tu sesión');
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) throw new AppError('MISSING_TOKEN', 'Token requerido', 400);
    await authService.verifyEmailToken(token);
    successResponse(res, null, 'Cuenta verificada exitosamente.');
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Fallo al verificar correo.');
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('MISSING_FIELDS', 'Email requerido', 400);
    await authService.requestPasswordReset(email);
    successResponse(res, null, 'Instrucciones enviadas.');
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Fallo al solicitar reseteo.');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new AppError('MISSING_FIELDS', 'Parámetros incompletos', 400);
    await authService.resetUserPassword(token, newPassword);
    successResponse(res, null, 'Contraseña actualizada');
  } catch(err) {
    if (err instanceof AppError) {
      return errorResponse(res, err.errorCode, err.message, err.statusCode);
    }
    errorResponse(res, 'SERVER_ERROR', 'Fallo reseteando contraseña.');
  }
};
