#!/bin/bash

# Parar se houver erro
set -e

# Configuração não interativa para apt
export DEBIAN_FRONTEND=noninteractive

echo ">>> [1/6] Atualizando sistema..."
sudo apt-get update
sudo apt-get install -y curl git build-essential

echo ">>> [2/6] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js já instalado: $(node -v)"
fi

echo ">>> [3/6] Limpando instalação anterior..."
# Remove lixo que causa erro de versão
rm -rf node_modules
rm -rf dist
rm -f package-lock.json

echo ">>> [4/6] Instalando e compilando..."
# Instala dependências
npm install
# Cria a pasta dist (produção)
npm run build

echo ">>> [5/6] Configurando serviço Node.js..."
APP_DIR="/var/www/gestor-financeiro"
APP_USER="nodeapp"

# Cria usuário para rodar a aplicação (se não existir)
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash "$APP_USER"
    echo "Usuário $APP_USER criado"
fi

# Cria pasta do servidor e copia arquivos
sudo mkdir -p $APP_DIR
sudo rm -rf $APP_DIR/*
sudo cp -r . $APP_DIR/

# Ajusta permissões
sudo chown -R $APP_USER:$APP_USER $APP_DIR
sudo chmod -R 755 $APP_DIR

echo ">>> [6/6] Configurando systemd para manter a aplicação rodando..."

# Cria arquivo de serviço systemd
sudo tee /etc/systemd/system/gestor-financeiro.service > /dev/null <<EOF
[Unit]
Description=Gestor Financeiro Familiar - Node.js Application
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="NODE_ENV=production"
Environment="PORT=5000"

[Install]
WantedBy=multi-user.target
EOF

# Habilita e inicia o serviço
sudo systemctl daemon-reload
sudo systemctl enable gestor-financeiro
sudo systemctl start gestor-financeiro

# Verifica se o serviço está rodando
sleep 2
if sudo systemctl is-active --quiet gestor-financeiro; then
    echo "✓ Serviço iniciado com sucesso!"
    echo "✓ Acesse a aplicação em: http://$(hostname -I | awk '{print $1}'):5000"
else
    echo "✗ Erro ao iniciar o serviço. Verifique logs com: sudo journalctl -u gestor-financeiro -n 50"
    exit 1
fi

echo ">>> SUCESSO! O aplicativo deve estar acessível pelo IP."
echo ""
echo "Próximas ações úteis:"
echo "  Ver logs em tempo real: sudo journalctl -u gestor-financeiro -f"
echo "  Restart da aplicação: sudo systemctl restart gestor-financeiro"
echo "  Parar aplicação: sudo systemctl stop gestor-financeiro"
