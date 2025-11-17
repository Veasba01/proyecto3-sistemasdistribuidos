const database = require('./database');

async function verificarBaseDeDatos() {
  try {
    console.log('🔍 Verificando contenido de la base de datos...');
    await database.connect();

    // Verificar películas
    const peliculasCollection = database.getPeliculasCollection();
    const peliculas = await peliculasCollection.find({}).toArray();
    console.log(`\n📽️ PELÍCULAS: ${peliculas.length} encontradas`);
    if (peliculas.length > 0) {
      console.log('Primera película:', JSON.stringify(peliculas[0], null, 2));
    }

    // Verificar estudios
    const estudiosCollection = database.getEstudiosCollection();
    const estudios = await estudiosCollection.find({}).toArray();
    console.log(`\n🏢 ESTUDIOS: ${estudios.length} encontrados`);
    if (estudios.length > 0) {
      console.log('Primer estudio:', JSON.stringify(estudios[0], null, 2));
    }

    // Verificar directores
    const directoresCollection = database.getDirectoresCollection();
    const directores = await directoresCollection.find({}).toArray();
    console.log(`\n🎬 DIRECTORES: ${directores.length} encontrados`);
    if (directores.length > 0) {
      console.log('Primer director:', JSON.stringify(directores[0], null, 2));
    }

    // Verificar relaciones
    console.log('\n🔗 VERIFICANDO RELACIONES:');
    for (const pelicula of peliculas.slice(0, 3)) {
      const estudio = await estudiosCollection.findOne({ _id: pelicula.estudio_id });
      const director = await directoresCollection.findOne({ _id: pelicula.director_id });
      
      console.log(`\n"${pelicula.titulo}"`);
      console.log(`  Estudio: ${estudio ? estudio.nombre : 'NO ENCONTRADO'} (ID: ${pelicula.estudio_id})`);
      console.log(`  Director: ${director ? director.nombre : 'NO ENCONTRADO'} (ID: ${pelicula.director_id})`);
    }

  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error);
  } finally {
    await database.disconnect();
  }
}

verificarBaseDeDatos();