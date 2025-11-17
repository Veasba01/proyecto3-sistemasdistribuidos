const { createClient } = require('redis');

const REDIS_CONFIG = {
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  console.log('=== ESTUDIOS API (Redis) ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);

  let client = null;
  
  try {
    client = createClient(REDIS_CONFIG);
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    console.log('✅ Conectado a Redis');

    // Extraer ID de la URL si existe
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1];
    const isSpecificId = id && id !== 'estudios' && !id.includes('netlify');

    if (event.httpMethod === 'GET') {
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
          estudios.push(JSON.parse(estudioData));
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
    }

    if (event.httpMethod === 'POST') {
      // Crear nuevo estudio
      console.log('Creando nuevo estudio...');
      const body = JSON.parse(event.body);
      
      // Validar datos usando el modelo
      const Estudio = require('../models/Estudio');
      const errors = Estudio.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      // Generar ID único
      const keys = await client.keys('estudio_*');
      const maxNum = keys.reduce((max, key) => {
        const num = parseInt(key.split('_')[1]);
        return num > max ? num : max;
      }, 0);
      const nuevoId = `estudio_${String(maxNum + 1).padStart(3, '0')}`;

      const nuevoEstudio = {
        _id: nuevoId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await client.set(nuevoId, JSON.stringify(nuevoEstudio));
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Estudio creado exitosamente',
          data: nuevoEstudio
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Actualizar estudio existente
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de estudio requerido para actualizar' }),
        };
      }

      console.log(`Actualizando estudio con ID: ${id}`);
      const body = JSON.parse(event.body);
      
      // Verificar si existe
      const estudioExistente = await client.get(id);
      if (!estudioExistente) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Estudio no encontrado' }),
        };
      }

      // Validar datos
      const Estudio = require('../models/Estudio');
      const errors = Estudio.validate(body);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', details: errors }),
        };
      }

      const estudioAnterior = JSON.parse(estudioExistente);
      const estudioActualizado = {
        ...estudioAnterior,
        ...body,
        _id: id,
        updated_at: new Date().toISOString()
      };

      await client.set(id, JSON.stringify(estudioActualizado));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Estudio actualizado exitosamente',
          data: estudioActualizado
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Eliminar estudio
      if (!isSpecificId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de estudio requerido para eliminar' }),
        };
      }

      console.log(`Eliminando estudio con ID: ${id}`);
      
      // Verificar si hay películas asociadas
      const peliculasKeys = await client.keys('pelicula_*');
      let peliculasAsociadas = 0;
      for (const key of peliculasKeys) {
        const peliculaData = await client.get(key);
        const pelicula = JSON.parse(peliculaData);
        if (pelicula.estudio_id === id) {
          peliculasAsociadas++;
        }
      }
      
      if (peliculasAsociadas > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'No se puede eliminar el estudio porque tiene películas asociadas',
            peliculasAsociadas: peliculasAsociadas
          }),
        };
      }

      const resultado = await client.del(id);

      if (resultado === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Estudio no encontrado' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Estudio eliminado exitosamente'
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
};
