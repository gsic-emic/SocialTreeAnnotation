Estando en la carpeta 

	docker build . -t timber:latest  //timber es el nombre de la imagen

Una vez creada (tardará un rato) podemos correr un contenedor con la imagen

	docker run –d -p 8080:80 timber:latest   //el primer puerto el que queramos