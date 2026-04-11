const pool = require('../config/db');
const logger = require('./logger');

/**
 * Registra una acción de auditoría en la Base de Datos
 *
 * @param {Object} params
 * @param {number|null} params.userId - ID del usuario responsable
 * @param {string} params.action - El nombre de la accion (e.g. LOGIN, UPDATE_ORDER, DELETE_USER)
 * @param {string|null} params.entity - Entidad afectada (e.g. USER, ORDER)
 * @param {number|null} params.entityId - ID de la entidad
 * @param {Object} params.metadata - Data cruda (ej. old_value, new_value)
 * @param {string|null} params.ip - IP origen del request
 */
exports.logAudit = async ({ userId = null, action, entity = null, entityId = null, metadata = {}, ip = null }) => {
  try {
    const metaString = JSON.stringify(metadata);
    await pool.execute(
      'INSERT INTO audit_logs (usuario_id, action, entity, entity_id, metadata, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entity, entityId, metaString, ip]
    );
  } catch (err) {
    // Los fallos de auditoría no deben romper la ejecución, pero deben alertar ruidosamente al sistema central
    logger.error(`[AUDIT LEAK] Error asentando auditoría: ${err.message}`, { action, userId });
  }
};
