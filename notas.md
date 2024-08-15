Procedimiento:

- Primero usar init-db para crear la base de datos con sus tablas.
- Antes de crear y descargar un album hay que agregar un autor con `add-author`,si no existe, porque luego hay que poner el dato del autor en el json del source. Add author también guarda en la base.
- Crear el source del album.
- Luego `index.ts source-file.json`
  - En la source file, que hay una por album están los datos del album para descargar, con el enlace, los filtros a usar, etc.
  - El proceso va a recopilar y filtrar los links y descargar las imágenes.
  - Además va a guardar en el mismo archivo json la lista de los links descargados, que es la que se va a usar para mostrar las imágenes.
  - Antes había un paso intermedio, borraba manualmente las imagenes que no quería que queden en el albumme, y mediante `filterlinks.ts` creaba una lista de links solo con los que me quería quedar. Pero ahora la idea es que con los filtros solo queden las imagenes que quiero y los de descarga son los que quedan en el source.
  - Si se corre el index con --no-downloads se guardan los links sin tener que descargar las imagenes. Con un album nuevo la primera vez esta bueno hacerlo para ver si los filtros están bien pero luego ya no hace falta.
  - Con `download-sources.sh` se ejecuta `index.ts` para todos los albums en la carpeta `sources` sin descargar las imagenes.
- Finalmente con `links-to-db` se leen los links de los jsons y se guardan en la base de datos.