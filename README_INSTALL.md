# Instalação Manual no Ubuntu

Caso o script automático não funcione, siga estes passos:

## 1. Preparar Arquivos
Crie os seguintes arquivos na pasta do projeto no servidor:

**deploy.sh**
(Copie o conteúdo fornecido no chat)

**nginx.conf**
(Copie o conteúdo fornecido no chat)

## 2. Executar Instalação
No terminal, execute:

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## Solução de Problemas comuns

**Erro: npm error notarget**
Isso acontece se a versão de um pacote não existir. O script `deploy.sh` agora remove o `package-lock.json` antigo para forçar uma instalação limpa.

**Erro: Permissão negada**
Certifique-se de usar `sudo` e dar permissão de execução com `chmod +x`.
