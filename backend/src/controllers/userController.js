const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    successResponse(res, users, 'Usuarios obtenidos correctamente');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error al obtener usuarios', 500);
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    if (!rol) throw new AppError('MISSING_FIELDS', 'El campo rol es requerido', 400);
    await userService.updateUserRole(id, rol);
    successResponse(res, null, 'Rol actualizado correctamente');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error al actualizar rol', 500);
  }
};
