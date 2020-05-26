


(echo -n '{"id": "f4275", "image": "'; base64 /home/ubuntu/SocialTreeAnnotation/Cristina/complementos/flor_exif.jpg; echo '"}') | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/image 