const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

exports.getAllUsers = async () => {
  return await userRepository.findAllUsers();
};

exports.updateUserRole = async (id, rol) => {
  const validRoles = ['admin', 'cliente'];
  if (!validRoles.includes(rol)) {
    throw new AppError('INVALID_ROLE', 'Rol no permitido', 400);
  }
  await userRepository.updateRole(id, rol);
};
