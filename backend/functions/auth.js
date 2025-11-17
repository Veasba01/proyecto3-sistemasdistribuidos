const { createClient } = require('redis');
const { hashPassword, comparePassword, generateToken } = require('./utils/auth');
const Usuario = require('../models/Usuario');

const REDIS_CONFIG = {
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client = null;

  try {
    client = createClient(REDIS_CONFIG);
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

    const body = JSON.parse(event.body || '{}');
    const { username, password, email, nombre } = body;

    // REGISTRO de nuevo usuario
    if (event.path.includes('/auth/register') || event.path.includes('action=register')) {
      // Validar campos requeridos
      if (!username || !password || !email || !nombre) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Todos los campos son requeridos'
          }),
        };
      }

      // Verificar si el usuario ya existe
      const keys = await client.keys('usuario_*');
      for (const key of keys) {
        const usuarioData = await client.get(key);
        const usuario = JSON.parse(usuarioData);
        if (usuario.username === username || usuario.email === email) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'El usuario o email ya existe'
            }),
          };
        }
      }

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario(username, await hashPassword(password), email, nombre);
      const usuarioData = {
        _id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        password: nuevoUsuario.password,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        role: nuevoUsuario.role,
        createdAt: nuevoUsuario.createdAt.toISOString(),
        lastLogin: nuevoUsuario.lastLogin
      };

      await client.set(nuevoUsuario._id, JSON.stringify(usuarioData));

      // Generar token
      const token = generateToken(nuevoUsuario);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Usuario registrado exitosamente',
          data: {
            user: nuevoUsuario.toJSON(),
            token
          }
        }),
      };
    }

    // LOGIN de usuario existente
    if (event.path.includes('/auth/login') || event.path.includes('action=login')) {
      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Usuario y contraseña son requeridos'
          }),
        };
      }

      // Buscar usuario por username
      const keys = await client.keys('usuario_*');
      let usuario = null;
      
      for (const key of keys) {
        const usuarioData = await client.get(key);
        const usuarioTemp = JSON.parse(usuarioData);
        if (usuarioTemp.username === username) {
          usuario = usuarioTemp;
          break;
        }
      }

      if (!usuario) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Credenciales inválidas'
          }),
        };
      }

      // Verificar contraseña
      const passwordValida = await comparePassword(password, usuario.password);

      if (!passwordValida) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Credenciales inválidas'
          }),
        };
      }

      // Actualizar último login
      usuario.lastLogin = new Date().toISOString();
      await client.set(usuario._id, JSON.stringify(usuario));

      // Generar token
      const token = generateToken(usuario);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login exitoso',
          data: {
            user: {
              _id: usuario._id,
              username: usuario.username,
              email: usuario.email,
              nombre: usuario.nombre,
              role: usuario.role
            },
            token
          }
        }),
      };
    }

    // VERIFICAR token
    if (event.path.includes('/auth/verify') || event.path.includes('action=verify')) {
      const { verifyToken } = require('./utils/auth');
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Token no proporcionado'
          }),
        };
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = verifyToken(token);
        const usuarioData = await client.get(decoded.userId);

        if (!usuarioData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Usuario no encontrado'
            }),
          };
        }

        const usuario = JSON.parse(usuarioData);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: {
              user: {
                _id: usuario._id,
                username: usuario.username,
                email: usuario.email,
                nombre: usuario.nombre,
                role: usuario.role
              }
            }
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Token inválido o expirado'
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Ruta no encontrada'
      }),
    };

  } catch (error) {
    console.error('Error en autenticación:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error del servidor',
        details: error.message
      }),
    };
  } finally {
    if (client) {
      await client.quit();
    }
  }
};
