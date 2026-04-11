// Validacion de entorno crítica (Fail-Fast)
const validateEnv = () => {
  const requieredVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_SECRET'
  ];

  const missing = requieredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('======================================================');
    console.error('❌ SE DETUVO EL ARRANQUE DEL SERVIDOR (FALTA CONFIGURACION)');
    console.error(`Variables de entorno obligatorias ausentes: ${missing.join(', ')}`);
    console.error('Asegúrese de definir estas variables en el entorno o en el archivo .env');
    console.error('======================================================');
    process.exit(1);
  }
};

module.exports = validateEnv;
