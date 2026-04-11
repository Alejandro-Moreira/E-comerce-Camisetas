const analyticsRepository = require('../repositories/analyticsRepository');

exports.trackClick = async (userId, page, x, y, timestamp) => {
  if (!page || x === undefined || y === undefined) {
    throw new Error('Parámetros de telemetría incompletos');
  }

  const id = userId || 'Anonimo';
  const time = timestamp ? new Date(timestamp) : new Date();

  // Guardar en BD
  const insertId = await analyticsRepository.saveClick(id, page, x, y, time);

  // Limpieza periódica asíncrona: Elimina clics más antiguos de 30 días para evitar saturar MySQL
  // Esto no bloquea la respuesta principal.
  analyticsRepository.deleteOlderThan(30).catch(console.error);

  return insertId;
};
