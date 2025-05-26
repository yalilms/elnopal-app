const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt instalado: npm install bcrypt

const passwordToHash = 'moisesunity1200372'; // <-- ¡IMPORTANTE! Pon aquí la contraseña que quieres hashear
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