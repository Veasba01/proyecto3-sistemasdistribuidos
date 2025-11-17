const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
const JWT_EXPIRATION = '24h';

/**
 * Genera un hash de la contraseña
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña con su hash
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Genera un token JWT
 */
function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verifica y decodifica un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Extrae el token del header Authorization
 */
function extractToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
}

/**
 * Middleware para verificar autenticación
 */
function requireAuth(event) {
  const token = extractToken(event);
  
  if (!token) {
    throw new Error('No se proporcionó token de autenticación');
  }

  return verifyToken(token);
}

/**
 * Middleware para verificar rol de administrador
 */
function requireAdmin(event) {
  const decoded = requireAuth(event);
  
  if (decoded.role !== 'admin') {
    throw new Error('Se requieren permisos de administrador');
  }

  return decoded;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
  requireAuth,
  requireAdmin
};
