const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt instalado: npm install bcrypt

const passwordToHash = process.argv[2] || ''; // Se pasa como argumento desde línea de comandos

if (!passwordToHash) {
  console.error('Error: Debes proporcionar la contraseña como argumento');
  console.log('Uso: node hash_password.js TU_CONTRASEÑA_AQUI');
  process.exit(1);
}
const saltRounds = 10; // Cost factor (10-12 es lo normal)

bcrypt.hash(passwordToHash, saltRounds, function(err, hash) {
  if (err) {
    console.error("Error al generar el hash:", err);
    return;
  }
  console.log("Contraseña original:", passwordToHash);
  console.log("Hash Bcrypt generado:", hash);
  console.log("\nCopia y pega este hash en el campo 'password' de tu documento de usuario en MongoDB Atlas.");
}); 