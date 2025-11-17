const { createClient } = require('redis');
const { enviarMensaje } = require('./utils/rabbitmq');
const { requireAuth } = require('./utils/auth');

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('=== ESTUDIOS API (RabbitMQ + Redis) ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  const pathParts = event.path.split('/');
  const id = pathParts[pathParts.length - 1];
  const isSpecificId = id && id !== 'estudios' && !id.includes('netlify');

  // ========================================
  // OPERACIONES DE CONSULTA (GET) - Directamente a Redis
  // ========================================
  if (event.httpMethod === 'GET') {
    let client = null;
    
    try {
      client = createClient(REDIS_CONFIG);
      client.on('error', err => console.log('Redis Client Error', err));
      await client.connect();
      console.log('✅ Conectado a Redis');

      if (isSpecificId) {
        // Obtener un estudio específico con sus películas
        console.log(`Consultando estudio con ID: ${id}`);
        const estudioData = await client.get(id);
        
        if (!estudioData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Estudio no encontrado' }),
          };
        }

        const estudio = JSON.parse(estudioData);

        // Obtener películas del estudio
        const peliculasKeys = await client.keys('pelicula_*');
        const peliculas = [];
        for (const key of peliculasKeys) {
          const peliculaData = await client.get(key);
          const pelicula = JSON.parse(peliculaData);
          if (pelicula.estudio_id === id) {
            peliculas.push(pelicula);
          }
        }
        estudio.peliculas = peliculas;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: estudio
          }),
        };
      } else {
        // Obtener todos los estudios
        console.log('Consultando todos los estudios...');
        const keys = await client.keys('estudio_*');
        const estudios = [];

        for (const key of keys) {
          const estudioData = await client.get(key);
          const estudio = JSON.parse(estudioData);
          
          // Obtener películas del estudio
          const peliculasKeys = await client.keys('pelicula_*');
          const peliculas = [];
          for (const pKey of peliculasKeys) {
            const peliculaData = await client.get(pKey);
            const pelicula = JSON.parse(peliculaData);
            if (pelicula.estudio_id === estudio._id) {
              peliculas.push(pelicula);
            }
          }
          estudio.peliculas = peliculas;
          estudios.push(estudio);
        }

        console.log(`Estudios encontrados: ${estudios.length}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: estudios.length,
            data: estudios
          }),
        };
      }
    } catch (error) {
      console.error('❌ ERROR en GET:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Error interno del servidor',
          details: error.message
        }),
      };
    } finally {
      if (client) {
        await client.quit();
        console.log('🔐 Desconectado de Redis');
      }
    }
  }

  // ========================================
  // OPERACIONES DE ESCRITURA - Enviar a RabbitMQ
  // ========================================
  
  try {
    requireAuth(event);

    if (event.httpMethod === 'POST') {
      console.log('Enviando operación CREATE a RabbitMQ...');
      const body = JSON.parse(event.body);
      
      const Estudio = require('../models/Estudio');
      const errors = Estudio.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const nuevoId = `estudio_${Date.now()}`;
      const nuevoEstudio = {
        _id: nuevoId,
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      };

      const resultado = await enviarMensaje('CREATE_ESTUDIO', nuevoEstudio);

      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          data: { _id: nuevoId, ...body, messageId: resultado.messageId }
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de estudio requerido para actualizar' }),
        };
      }

      console.log(`Enviando operación UPDATE a RabbitMQ para estudio: ${id}`);
      const body = JSON.parse(event.body);
      
      const Estudio = require('../models/Estudio');
      const errors = Estudio.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const estudioActualizado = {
        _id: id,
        ...body,
        updated_at: new Date()
      };

      const resultado = await enviarMensaje('UPDATE_ESTUDIO', estudioActualizado);

      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          data: estudioActualizado,
          messageId: resultado.messageId
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de estudio requerido para eliminar' }),
        };
      }

      console.log(`Enviando operación DELETE a RabbitMQ para estudio: ${id}`);

      const resultado = await enviarMensaje('DELETE_ESTUDIO', { _id: id });

      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          messageId: resultado.messageId
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };

  } catch (error) {
    console.error('❌ ERROR:', error);
    
    if (error.message.includes('Token') || error.message.includes('autenticación')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'No autorizado',
          details: error.message
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message
      }),
    };
  }
};
