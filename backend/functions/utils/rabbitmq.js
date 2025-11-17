const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'peliculas_operaciones';

/**
 * Envía un mensaje a RabbitMQ
 */
async function enviarMensaje(operacion, datos) {
  let connection;
  let channel;

  try {
    // Conectar a RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Asegurar que la cola existe
    await channel.assertQueue(QUEUE_NAME, {
      durable: true // La cola sobrevive a reinicios del servidor
    });

    const mensaje = {
      operacion, // 'CREATE', 'UPDATE', 'DELETE'
      datos,
      timestamp: new Date().toISOString(),
      id: `${operacion}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Enviar mensaje a la cola
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(mensaje)),
      {
        persistent: true // El mensaje sobrevive a reinicios del servidor
      }
    );

    console.log('✅ Mensaje enviado a RabbitMQ:', mensaje.id);

    await channel.close();
    await connection.close();

    return {
      success: true,
      messageId: mensaje.id,
      message: 'Operación enviada a la cola para procesamiento'
    };

  } catch (error) {
    console.error('❌ Error enviando mensaje a RabbitMQ:', error);
    
    // Cerrar conexiones si están abiertas
    if (channel) await channel.close().catch(() => {});
    if (connection) await connection.close().catch(() => {});

    throw error;
  }
}

/**
 * Procesa todos los mensajes pendientes en la cola
 */
async function procesarMensajes(redisClient) {
  let connection;
  let channel;
  let mensajesProcesados = 0;
  let errores = [];

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Configurar prefetch para procesar un mensaje a la vez
    channel.prefetch(1);

    console.log('📥 Esperando mensajes en la cola...');

    // Obtener información de la cola
    const queueInfo = await channel.checkQueue(QUEUE_NAME);
    console.log(`Mensajes en cola: ${queueInfo.messageCount}`);

    if (queueInfo.messageCount === 0) {
      await channel.close();
      await connection.close();
      return {
        success: true,
        processed: 0,
        errors: [],
        message: 'No hay mensajes pendientes en la cola'
      };
    }

    // Procesar mensajes
    return new Promise((resolve, reject) => {
      let timeout;

      // Timeout de 5 segundos sin mensajes
      const resetTimeout = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(async () => {
          console.log('⏱️ Timeout - No hay más mensajes');
          await channel.close();
          await connection.close();
          resolve({
            success: true,
            processed: mensajesProcesados,
            errors: errores,
            message: `Procesados ${mensajesProcesados} mensajes`
          });
        }, 5000);
      };

      channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
          resetTimeout();

          try {
            const contenido = JSON.parse(msg.content.toString());
            console.log('📨 Procesando mensaje:', contenido.id);

            await ejecutarOperacion(redisClient, contenido);

            // Confirmar que el mensaje fue procesado
            channel.ack(msg);
            mensajesProcesados++;
            console.log('✅ Mensaje procesado exitosamente');

          } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            errores.push({
              error: error.message,
              mensaje: msg.content.toString()
            });

            // Rechazar el mensaje y no reencolar
            channel.nack(msg, false, false);
          }
        }
      });

      resetTimeout();
    });

  } catch (error) {
    console.error('❌ Error procesando mensajes:', error);
    
    if (channel) await channel.close().catch(() => {});
    if (connection) await connection.close().catch(() => {});

    throw error;
  }
}

/**
 * Ejecuta una operación en Redis
 */
async function ejecutarOperacion(redisClient, mensaje) {
  const { operacion, datos } = mensaje;

  switch (operacion) {
    case 'CREATE_PELICULA':
      await redisClient.set(datos._id, JSON.stringify(datos));
      break;

    case 'UPDATE_PELICULA':
      const peliculaExistente = await redisClient.get(datos._id);
      if (peliculaExistente) {
        const peliculaActualizada = { ...JSON.parse(peliculaExistente), ...datos };
        await redisClient.set(datos._id, JSON.stringify(peliculaActualizada));
      }
      break;

    case 'DELETE_PELICULA':
      await redisClient.del(datos._id);
      break;

    case 'CREATE_ESTUDIO':
      await redisClient.set(datos._id, JSON.stringify(datos));
      break;

    case 'UPDATE_ESTUDIO':
      const estudioExistente = await redisClient.get(datos._id);
      if (estudioExistente) {
        const estudioActualizado = { ...JSON.parse(estudioExistente), ...datos };
        await redisClient.set(datos._id, JSON.stringify(estudioActualizado));
      }
      break;

    case 'DELETE_ESTUDIO':
      await redisClient.del(datos._id);
      break;

    case 'CREATE_DIRECTOR':
      await redisClient.set(datos._id, JSON.stringify(datos));
      break;

    case 'UPDATE_DIRECTOR':
      const directorExistente = await redisClient.get(datos._id);
      if (directorExistente) {
        const directorActualizado = { ...JSON.parse(directorExistente), ...datos };
        await redisClient.set(datos._id, JSON.stringify(directorActualizado));
      }
      break;

    case 'DELETE_DIRECTOR':
      await redisClient.del(datos._id);
      break;

    default:
      throw new Error(`Operación desconocida: ${operacion}`);
  }

  console.log(`✅ Operación ${operacion} ejecutada en Redis`);
}

module.exports = {
  enviarMensaje,
  procesarMensajes
};
