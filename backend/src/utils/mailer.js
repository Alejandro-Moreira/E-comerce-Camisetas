const nodemailer = require('nodemailer');

let transporter = null;

async function initMailer() {
  if (transporter) return transporter;
  // Crea una cuenta efímera de Ethereal cada que inicia el servidor
  console.log('Generando Cuenta Ethereal (Test de Correo)...');
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // Generado
      pass: testAccount.pass, // Generado
    },
  });
  console.log('✔️ Ethereal Mailer en Línea:', testAccount.user);
  return transporter;
}

// Envía correos e imprime la URL de previsualización en consola
const enviarCorreo = async (destino, asunto, htmlTexto) => {
  try {
    const trx = await initMailer();
    const info = await trx.sendMail({
      from: '"E-commerce T-Shirt SaaS Admin 👕" <noreply@tshirtsaas.com>',
      to: destino,
      subject: asunto,
      html: htmlTexto,
    });
    console.log('--- 📩 CORREO ENVIADO A LA NUBE FALSA ---');
    console.log('Abra este enlace en su navegador para leerlo:');
    console.log(nodemailer.getTestMessageUrl(info));
    console.log('-------------------------------------------');
  } catch (error) {
    console.error('Fallo enviando correo:', error);
  }
};

module.exports = { enviarCorreo };
