// Script de prueba para verificar la conexión a Redis
const database = require('./database');

async function testRedis() {
  try {
    console.log('🔄 Conectando a Redis...');
    await database.connect();
    
    console.log('\n📊 Probando consultas...');
    
    // Probar obtener todas las películas
    const peliculas = await database.getAllPeliculas();
    console.log(`✅ Películas encontradas: ${peliculas.length}`);
    
    if (peliculas.length > 0) {
      console.log('\n🎬 Primera película:');
      console.log(JSON.stringify(peliculas[0], null, 2));
    }
    
    // Probar obtener todos los directores
    const directores = await database.getAllDirectores();
    console.log(`\n✅ Directores encontrados: ${directores.length}`);
    
    // Probar obtener todos los estudios
    const estudios = await database.getAllEstudios();
    console.log(`✅ Estudios encontrados: ${estudios.length}`);
    
    // Probar obtener una película específica
    if (peliculas.length > 0) {
      const primeraPelicula = peliculas[0];
      const pelicula = await database.getPelicula(primeraPelicula._id.split('_')[1]);
      console.log(`\n🎯 Película específica (${primeraPelicula._id}):`);
      console.log(`   Título: ${pelicula.titulo}`);
      console.log(`   Año: ${pelicula.año}`);
    }
    
    console.log('\n✅ Todas las pruebas pasaron correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await database.disconnect();
    console.log('\n👋 Desconectado de Redis');
  }
}

// Ejecutar las pruebas
testRedis();
