# Proyecto 3 - Aplicación mediante Redis

El objetivo del tercer proyecto consiste en desarrollar un aplicación
que utilice servicios web tipo REST con información proveniente de una
base de datos Redis. Cada estudiante debe implementar la base de datos
que utilizó en el segundo proyecto.

El funcionamiento de los servicios web estará regido por la convención
de manejo de recursos en servicios RESTful. Por tanto se deben
desarrollar las operaciones para consultar, actualizar, modificar y
eliminar diferentes recursos usando las técnicas utilizadas por dicho
tipo de servicios.

## Base de datos

Se debe crear una base de datos Redis en el sitio Redis.com y subir
todos los datos recolectados en el primer proyecto. Note que en Redis no
existen tablas por lo que se deben identificar los diferentes tipos de
registros por sus llaves, por ejemplo: 'book_1', 'author_1' ó
'publisher_1'.

Debido a que no existe un método de subir dichos datos directamente a
través del sitio, se deberá utiliza el comando `rdcli` para agregar, en
forma interactiva, todos los registros de datos.

## Backend

El back-end de la aplicación debe ser desarrollado en Redis mediante
funciones de Netlify. Este back-end permitirá consultar los datos de las
diferentes entidades de datos. Adicionalmente el back-end permitirá
crear, actualizar y eliminar registros.

## Frontends

Se desarrollarán un frontend (cliente) para acceder a los servicios web.
Se debe crear un frontend para cada entidad de la aplicación. Se deberá
utilizar la librería javascript Vue.js para desarrollar los frontends,
al igual que en los tutoriales.

## Aspectos Generales

2.  El sitio debe ser publicado en Netlify.
