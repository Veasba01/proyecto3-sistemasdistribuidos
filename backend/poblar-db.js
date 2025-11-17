const database = require('./database');
const peliculasData = require('./data/peliculas.json');
const estudiosData = require('./data/estudios.json');
const directoresData = require('./data/directores.json');

async function poblarBaseDeDatos() {
  try {
    console.log('Conectando a Redis...');
    await database.connect();
    const client = database.getClient();

    // Limpiar datos existentes
    console.log('Limpiando datos existentes...');
    const peliculasKeys = await client.keys('pelicula_*');
    const estudiosKeys = await client.keys('estudio_*');
    const directoresKeys = await client.keys('director_*');
    
    if (peliculasKeys.length > 0) await client.del(peliculasKeys);
    if (estudiosKeys.length > 0) await client.del(estudiosKeys);
    if (directoresKeys.length > 0) await client.del(directoresKeys);

    // Insertar estudios
    console.log('Insertando estudios en Redis...');
    let estudiosInsertados = 0;
    for (const estudio of estudiosData) {
      await client.set(estudio._id, JSON.stringify(estudio));
      estudiosInsertados++;
    }
    console.log(`${estudiosInsertados} estudios insertados`);

    // Insertar directores
    console.log('Insertando directores en Redis...');
    let directoresInsertados = 0;
    for (const director of directoresData) {
      await client.set(director._id, JSON.stringify(director));
      directoresInsertados++;
    }
    console.log(`${directoresInsertados} directores insertados`);

    // Insertar películas
    console.log('Insertando películas en Redis...');
    let peliculasInsertadas = 0;
    for (const pelicula of peliculasData) {
      await client.set(pelicula._id, JSON.stringify(pelicula));
      peliculasInsertadas++;
    }
    console.log(`${peliculasInsertadas} películas insertadas`);

    console.log('¡Base de datos Redis poblada exitosamente!');
    
    // Verificar datos
    const totalPeliculas = (await client.keys('pelicula_*')).length;
    const totalEstudios = (await client.keys('estudio_*')).length;
    const totalDirectores = (await client.keys('director_*')).length;

    console.log('\n=== RESUMEN ===');
    console.log(`Total de películas: ${totalPeliculas}`);
    console.log(`Total de estudios: ${totalEstudios}`);
    console.log(`Total de directores: ${totalDirectores}`);

  } catch (error) {
    console.error('Error poblando Redis:', error);
  } finally {
    await database.disconnect();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  poblarBaseDeDatos();
}

module.exports = poblarBaseDeDatos;
