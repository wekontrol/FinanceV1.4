#!/bin/bash

# Parar se houver erro
set -e

# Configuração não interativa para apt
export DEBIAN_FRONTEND=noninteractive

echo ">>> [1/5] Atualizando sistema..."
# sudo apt-get update
sudo apt-get install -y curl git nginx

echo ">>> [2/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js já instalado: $(node -v)"
fi

echo ">>> [3/5] Limpando instalação anterior..."
# Remove lixo que causa erro de versão
rm -rf node_modules
rm -rf dist
rm -f package-lock.json

echo ">>> [4/5] Instalando e compilando..."
# Instala dependências
npm install
# Cria a pasta dist (produção)
npm run build

echo ">>> [5/5] Configurando Servidor Web (Nginx)..."
APP_DIR="/var/www/gestor-financeiro"

# Cria pasta do servidor e limpa conteúdo antigo
sudo mkdir -p $APP_DIR
sudo rm -rf $APP_DIR/*

# Copia os arquivos gerados no build para o servidor
sudo cp -r dist/* $APP_DIR/

# Ajusta permissões
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Configura o Nginx se o arquivo existir
if [ -f "nginx.conf" ]; then
    echo "Aplicando configuração Nginx..."
    sudo cp nginx.conf /etc/nginx/sites-available/gestor-financeiro
    sudo ln -sf /etc/nginx/sites-available/gestor-financeiro /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testa configuração
    sudo nginx -t
    
    # Reinicia serviço
    sudo systemctl restart nginx
else
    echo "ERRO: Arquivo nginx.conf não encontrado na pasta atual!"
    exit 1
fi

echo ">>> SUCESSO! O aplicativo deve estar acessível pelo IP."