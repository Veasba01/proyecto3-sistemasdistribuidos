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

  console.log('=== DIRECTORES API (RabbitMQ + Redis) ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  const pathParts = event.path.split('/');
  const id = pathParts[pathParts.length - 1];
  const isSpecificId = id && id !== 'directores' && !id.includes('netlify');

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
        // Obtener un director específico con sus películas
        console.log(`Consultando director con ID: ${id}`);
        const directorData = await client.get(id);
        
        if (!directorData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Director no encontrado' }),
          };
        }

        const director = JSON.parse(directorData);

        // Obtener películas del director
        const peliculasKeys = await client.keys('pelicula_*');
        const peliculas = [];
        for (const key of peliculasKeys) {
          const peliculaData = await client.get(key);
          const pelicula = JSON.parse(peliculaData);
          if (pelicula.director_id === id) {
            peliculas.push(pelicula);
          }
        }
        director.peliculas = peliculas;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: director
          }),
        };
      } else {
        // Obtener todos los directores
        console.log('Consultando todos los directores...');
        const keys = await client.keys('director_*');
        const directores = [];

        for (const key of keys) {
          const directorData = await client.get(key);
          const director = JSON.parse(directorData);
          
          // Obtener películas del director
          const peliculasKeys = await client.keys('pelicula_*');
          const peliculas = [];
          for (const pKey of peliculasKeys) {
            const peliculaData = await client.get(pKey);
            const pelicula = JSON.parse(peliculaData);
            if (pelicula.director_id === director._id) {
              peliculas.push(pelicula);
            }
          }
          director.peliculas = peliculas;
          directores.push(director);
        }

        console.log(`Directores encontrados: ${directores.length}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: directores.length,
            data: directores
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
      
      const Director = require('../models/Director');
      const errors = Director.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const nuevoId = `director_${Date.now()}`;
      const nuevoDirector = {
        _id: nuevoId,
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      };

      const resultado = await enviarMensaje('CREATE_DIRECTOR', nuevoDirector);

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
          body: JSON.stringify({ error: 'ID de director requerido para actualizar' }),
        };
      }

      console.log(`Enviando operación UPDATE a RabbitMQ para director: ${id}`);
      const body = JSON.parse(event.body);
      
      const Director = require('../models/Director');
      const errors = Director.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const directorActualizado = {
        _id: id,
        ...body,
        updated_at: new Date()
      };

      const resultado = await enviarMensaje('UPDATE_DIRECTOR', directorActualizado);

      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          data: directorActualizado,
          messageId: resultado.messageId
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de director requerido para eliminar' }),
        };
      }

      console.log(`Enviando operación DELETE a RabbitMQ para director: ${id}`);

      const resultado = await enviarMensaje('DELETE_DIRECTOR', { _id: id });

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
