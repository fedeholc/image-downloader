Procedimiento:

- Primero usar init-db para crear la base de datos con sus tablas.
- Antes de crear y descargar un album hay que agregar un autor con `add-author`,si no existe, porque luego hay que poner el dato del autor en el json del source. Add author también guarda en la base.
- Crear el source del album.
- Luego `download-source.ts source-file.json`
  - En la source file, que hay una por album están los datos del album para descargar, con el enlace, los filtros a usar, etc.
  - El proceso va a recopilar y filtrar los links y descargar las imágenes.
  - Además va a guardar en el mismo archivo json la lista de los links descargados, que es la que se va a usar para mostrar las imágenes.
  - Antes había un paso intermedio, borraba manualmente las imagenes que no quería que queden en el album, y mediante `filterlinks.ts` creaba una lista de links solo con los que me quería quedar. Pero ahora la idea es que con los filtros solo queden las imagenes que quiero y los de descarga son los que quedan en el source.
  - _PERO_ ojo, hay páginas como Artsy que requieren de un filtrado manual. Para eso lo que hice fue crear "removelinks.ts" para correrlo despues que se bajo todo y se guardaron los links en el json del source, etc. Lo que se hace es borran las imágenes que no se quieren y se corre el removelinks que va a actualizar el json del source con los links que quedan, guardar los rejected, cambiar los id de las imágenes que quedan para que la numeración quede continua, etc.
  - Si se corre el index con --no-downloads se guardan los links sin tener que descargar las imagenes. Con un album nuevo la primera vez esta bueno hacerlo para ver si los filtros están bien pero luego ya no hace falta.
  - Con `download-sources.sh` se ejecuta `index.ts` para todos los albums en la carpeta `sources` sin descargar las imagenes.
- Finalmente con `links-to-db` se leen los links de los jsons y se guardan en la base de datos.

---

sed -i 's/height=[0-9]\{3\}/height=1080/g' s004-krasner.json
sed -i.bak 's/width=[0-9]\{3\}/width=1920/g' s004-krasner.json
