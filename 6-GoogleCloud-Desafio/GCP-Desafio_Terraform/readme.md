# Desafio Pipeline CICD Cloud Build + Terraform.

1. Utilize o git https://github.com/digitalinnovationone/terraform-gcp/tree/main/terraform-exemplo2 para configurar a trigger do Cloud Build.

2. Edite o script para trocar o nome da máquina para cloudbbuildterraform.

3. Salve os arquivos do Estado no Google Cloud Storage.

Submeta o print de cada etapa de configuração do Pipeline .

Instalação E Configuração Spinnaker
O Spinnaker no Goole Cloud utiliza GKE, Memorystore, buckets do Cloud Storage e contas de serviço.

Passo 1 - Clone do Repositório https://github.com/GoogleCloudPlatform/spinnaker-for-gcp.git
mkdir ~/cloudshell_open && cd ~/cloudshell_open
git clone https://github.com/GoogleCloudPlatform/spinnaker-for-gcp.git
cd spinnaker-for-gcp
Passo 2 - Criação das variáveis para instalação do Spinnaker
./scripts/install/setup_properties.sh
Passo 3 - Confierir as variáveis geradas.
cat ./scripts/install/properties
Passo 4 - Aplicar as variáveis no sistema de variáveis do Clou Shell.
source ./scripts/install/properties
Passo 5 - Configurações de git user.email e user.name
git config --global user.email "USER@empresa.com"
git config --global user.name "USER"
Passo 6 - Iniciar a instalação
./scripts/install/setup.sh
A instalação pode levar uma média de 15 minutos.

Passo 7 - Conectando na Interface do Spinnaker
./scripts/manage/connect_unsecured.sh
Inclusao segundo cluster GKE
Passo 1 - Configurar a região do cluster
APP_REGION=us-east1-b; gcloud config set compute/zone $APP_REGION
Passo 2 - Criação do Cluster
gcloud container clusters create app-cluster --machine-type=n1-standard-2
Passo 3 - Configurar o Spinnaker Cluster
./scripts/manage/add_gke_account.sh
kubectl config use-context gke_${PROJECT_ID}_${ZONE}_spinnaker-1
./scripts/manage/push_and_apply.sh
Configurando o Pipeline de Exemplo
1. Entre na pasta samples
cd ./samples/helloworldwebapp/
~/spin app save --application-name helloworldwebapp \
    --cloud-providers kubernetes --owner-email $IAP_USER
2. Faça deploy do Pipeline de Stagging
cat templates/pipelines/deploystaging_json.template | envsubst  > templates/pipelines/deploystaging.json
~/spin pi save -f templates/pipelines/deploystaging.json
3. Salve o Stagging Pipeline ID
export DEPLOY_STAGING_PIPELINE_ID=$(~/spin pi get -a helloworldwebapp -n 'Deploy to Staging' | jq -r '.id')
4. Faça deploy do Pipeline de Prod
cat templates/pipelines/deployprod_json.template | envsubst  > templates/pipelines/deployprod.json
~/spin pi save -f templates/pipelines/deployprod.json
Criando o código fonte da aplicação
1. Crie uma pasta com o código fonte
mkdir -p ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/
cp -r templates/repo/src ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/
2. Copie o código fonte da aplicação
cp -r templates/repo/config ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/
cp templates/repo/Dockerfile ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/
cat templates/repo/cloudbuild_yaml.template | envsubst '$BUCKET_NAME' > ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/cloudbuild.yaml
cat ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/staging/replicaset_yaml.template | envsubst > ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/staging/replicaset.yaml
rm ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/staging/replicaset_yaml.template
cat ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/prod/replicaset_yaml.template | envsubst > ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/prod/replicaset.yaml
rm ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp/config/prod/replicaset_yaml.template
Criando o Repositório Git com Google Cloud Source Repositories
1. Entre no diretório da aplicação
cd ~/$PROJECT_ID/spinnaker-for-gcp-helloworldwebapp
2. Inicialize o git adicionando os arquivos e fazendo o commit
git init
git add .
git commit -m "Initial commit"
3. Crie o repositório
gcloud source repos create spinnaker-for-gcp-helloworldwebapp
git config credential.helper gcloud.sh
4. Adicione o repositório remoto
git remote add origin https://source.developers.google.com/p/$PROJECT_ID/r/spinnaker-for-gcp-helloworldwebapp
5. Push master
git push origin master
Configure Cloud Build Triggers
1. Revise os passos do Coud Build
cat ./cloudbuild.yaml
2. Crie o Cloud Build Trigger com gcloud sdk
gcloud beta builds triggers create cloud-source-repositories \
    --repo spinnaker-for-gcp-helloworldwebapp \
    --branch-pattern master \
    --build-config cloudbuild.yaml \
    --included-files "src/**,config/**"
Compilando a imagem da aplicação
1. Edite a aplicação e faça o commit
sed -i 's/Hello World/Hello World 1.0/g' ./src/main.go
git commit -a -m "Change to 1.0"
2. Faça o push para master
git push origin master