const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MYSQL_HOST = process.env.DB_HOST || 'localhost';
const MYSQL_USER = process.env.DB_USER || 'root';
const MYSQL_PASSWORD = process.env.DB_PASSWORD || '';
const MYSQL_DATABASE = process.env.DB_DATABASE || 'ecommerce_camisetas';

// Asegurar que el directorio de backups exista
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backupFile = path.join(backupDir, `backup_${MYSQL_DATABASE}_${timestamp}.sql`);

// Importante: No usar password prompt en prod automatizado.
const dumpCommand = `mysqldump -h ${MYSQL_HOST} -u ${MYSQL_USER} ${MYSQL_PASSWORD ? `-p"${MYSQL_PASSWORD}"` : ''} ${MYSQL_DATABASE} > "${backupFile}"`;

console.log(`Iniciando respaldo de base de datos automatizado: ${MYSQL_DATABASE}...`);

exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error de Respaldo: ${error.message}`);
    return;
  }
  if (stderr) {
    // mysqldump escribe advertencias en stderr, a menos que sea error fatal lo dejamos pasar advertencia.
    console.warn(`Advertencia mysqldump: ${stderr}`);
  }
  console.log(`✅ Respaldo exitoso generado en:\n   ${backupFile}`);
  console.log(`Se recomienda configurar un Cron Job en el servidor para correr este script diariamente.`);
});
