const { createClient } = require('redis');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const REDIS_CONFIG = {
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
};

async function poblarUsuarios() {
  const client = createClient(REDIS_CONFIG);
  client.on('error', err => console.log('Redis Client Error', err));

  try {
    await client.connect();
    console.log('✅ Conectado a Redis');

    // Crear usuarios de prueba
    const usuarios = [
      {
        _id: 'usuario_admin',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        email: 'admin@peliculas.com',
        nombre: 'Administrador',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: null
      },
      {
        _id: 'usuario_demo',
        username: 'demo',
        password: await bcrypt.hash('demo123', 10),
        email: 'demo@peliculas.com',
        nombre: 'Usuario Demo',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ];

    // Limpiar usuarios existentes
    const usuariosKeys = await client.keys('usuario_*');
    if (usuariosKeys.length > 0) {
      await client.del(usuariosKeys);
      console.log('🗑️  Usuarios anteriores eliminados');
    }

    // Insertar usuarios
    let insertados = 0;
    for (const usuario of usuarios) {
      await client.set(usuario._id, JSON.stringify(usuario));
      insertados++;
    }
    console.log(`✅ ${insertados} usuarios creados exitosamente`);

    console.log('\n📝 Credenciales de prueba:');
    console.log('1. Admin:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n2. Usuario Demo:');
    console.log('   Usuario: demo');
    console.log('   Contraseña: demo123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.quit();
    console.log('\n👋 Desconectado de Redis');
  }
}

poblarUsuarios();
