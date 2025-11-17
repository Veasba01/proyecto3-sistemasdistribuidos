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

  console.log('=== PELÍCULAS API (RabbitMQ + Redis) ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  // Extraer ID de la URL si existe
  const pathParts = event.path.split('/');
  const id = pathParts[pathParts.length - 1];
  const isSpecificId = id && id !== 'peliculas' && !id.includes('netlify');

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
        // Obtener una película específica
        console.log(`Consultando película con ID: ${id}`);
        const peliculaData = await client.get(id);
        
        if (!peliculaData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Película no encontrada' }),
          };
        }

        const pelicula = JSON.parse(peliculaData);

        // Obtener información relacionada
        let estudio = null;
        if (pelicula.estudio_id) {
          const estudioData = await client.get(pelicula.estudio_id);
          estudio = estudioData ? JSON.parse(estudioData) : null;
        }

        let director = null;
        if (pelicula.director_id) {
          const directorData = await client.get(pelicula.director_id);
          director = directorData ? JSON.parse(directorData) : null;
        }

        pelicula.estudio = estudio;
        pelicula.director = director;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: pelicula
          }),
        };
      } else {
        // Obtener todas las películas
        console.log('Consultando todas las películas...');
        const keys = await client.keys('pelicula_*');
        const peliculas = [];

        for (const key of keys) {
          const peliculaData = await client.get(key);
          const pelicula = JSON.parse(peliculaData);

          // Enriquecer con información relacionada
          if (pelicula.estudio_id) {
            const estudioData = await client.get(pelicula.estudio_id);
            pelicula.estudio = estudioData ? JSON.parse(estudioData) : null;
          }

          if (pelicula.director_id) {
            const directorData = await client.get(pelicula.director_id);
            pelicula.director = directorData ? JSON.parse(directorData) : null;
          }

          peliculas.push(pelicula);
        }

        console.log(`Películas encontradas: ${peliculas.length}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: peliculas.length,
            data: peliculas
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
    // Verificar autenticación para operaciones de escritura
    requireAuth(event);

    if (event.httpMethod === 'POST') {
      // Crear nueva película - Enviar a RabbitMQ
      console.log('Enviando operación CREATE a RabbitMQ...');
      const body = JSON.parse(event.body);
      
      // Validar datos básicos
      const Pelicula = require('../models/Pelicula');
      const errors = Pelicula.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      // Generar ID único
      const nuevaId = `pelicula_${Date.now()}`;
      const nuevaPelicula = {
        _id: nuevaId,
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Enviar a RabbitMQ
      const resultado = await enviarMensaje('CREATE_PELICULA', nuevaPelicula);

      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          data: { 
            _id: nuevaId, 
            ...body,
            messageId: resultado.messageId
          }
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Actualizar película - Enviar a RabbitMQ
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de película requerido para actualizar' }),
        };
      }

      console.log(`Enviando operación UPDATE a RabbitMQ para película: ${id}`);
      const body = JSON.parse(event.body);
      
      // Validar datos
      const Pelicula = require('../models/Pelicula');
      const errors = Pelicula.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const peliculaActualizada = {
        _id: id,
        ...body,
        updated_at: new Date()
      };

      // Enviar a RabbitMQ
      const resultado = await enviarMensaje('UPDATE_PELICULA', peliculaActualizada);

      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Operación enviada a la cola para procesamiento',
          data: peliculaActualizada,
          messageId: resultado.messageId
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Eliminar película - Enviar a RabbitMQ
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de película requerido para eliminar' }),
        };
      }

      console.log(`Enviando operación DELETE a RabbitMQ para película: ${id}`);

      // Enviar a RabbitMQ
      const resultado = await enviarMensaje('DELETE_PELICULA', { _id: id });

      return {
        statusCode: 202, // Accepted
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
    
    // Error de autenticación
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
