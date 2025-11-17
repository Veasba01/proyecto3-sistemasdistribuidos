const { createClient } = require('redis');
const { procesarMensajes } = require('./utils/rabbitmq');
const { requireAuth } = require('./utils/auth');

const REDIS_CONFIG = {
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
};

/**
 * Función que procesa todos los mensajes pendientes en RabbitMQ
 * Esta función debe ser llamada mediante una URL especial
 */
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

  console.log('=== PROCESADOR DE COLA RABBITMQ ===');

  let client = null;

  try {
    // Verificar autenticación (opcional, comentar si no se requiere)
    // requireAuth(event);

    console.log('Conectando a Redis...');
    client = createClient(REDIS_CONFIG);
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    console.log('✅ Conectado a Redis');

    console.log('Procesando mensajes de RabbitMQ...');
    const resultado = await procesarMensajes(client);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Procesamiento de cola completado',
        data: resultado
      }),
    };

  } catch (error) {
    console.error('❌ Error procesando cola:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error procesando la cola de mensajes',
        details: error.message
      }),
    };
  } finally {
    if (client) {
      await client.quit();
      console.log('Desconectado de Redis');
    }
  }
};
