echo " Criando as Imagens..."

docker build - t ricardocardoso/projeto-backend:1.0 backend/.
docker build - t ricardocardoso/projeto-database:1.0 database/.

echo "realizando o push das imagens..."

docker push ricardocardoso/projeto-backend:1.0
docker push ricardocardoso/projeto-database:1.0

echo " Criando serviços no cluster kubernetes..."

kubectl apply -f ./services.yml

echo "Criando os deployments ..."

kubectl apply -f ./deplyment.yml
