#!/bin/bash

# Recorre cada archivo .json en el directorio ./img-source
for file in ./sources/*.json
do
  # Muestra el nombre del archivo (con path completo) antes de ejecutar el comando
  echo "Procesando archivo: $file"
  
  # Ejecuta el comando tsx con el archivo actual (incluyendo el path completo)
  tsx index.ts "$file" --no-downloads
done
