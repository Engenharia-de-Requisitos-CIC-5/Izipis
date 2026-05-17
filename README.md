# 📦 Izipis - Sistema de Gestão para Mercados

Bem-vindo ao **Izipis**! Este é um sistema moderno de gestão de estoque e frente de caixa (PDV) desenvolvido para facilitar o dia a dia de pequenos e médios mercados.

Se você nunca baixou um projeto de programação na vida, não se preocupe! Siga este guia passo a passo e você terá o sistema rodando no seu computador em poucos minutos.

---

## 🚀 Como Rodar o Projeto (Passo a Passo)

### 1. Instale o que é necessário
Antes de tudo, seu computador precisa de uma "ferramenta" que entende o código do projeto. Essa ferramenta se chama **Node.js**.

1. Acesse o site oficial: [nodejs.org](https://nodejs.org/)
2. Baixe a versão escrita **"LTS"** (que é a mais estável).
3. Instale como qualquer outro programa (clicando em "Avançar" até o fim).

### 2. Baixe o projeto
Você provavelmente recebeu este projeto como um arquivo `.zip` ou clonou via GitHub.
*   Se for um `.zip`, **extraia os arquivos** em uma pasta de sua preferência (ex: na sua Área de Trabalho).

### 3. Abra o terminal
Agora precisamos dar comandos para o computador. 
1. No Windows, abra a pasta do projeto.
2. Clique na barra de endereços (lá no topo onde fica o caminho da pasta) e digite `cmd` e dê Enter.
3. Uma janela preta (o terminal) vai se abrir já dentro da pasta certa.

### 4. Instale as bibliotecas do projeto
O Izipis usa várias pecinhas prontas para funcionar. Para baixá-las, digite o seguinte comando na janela preta e aperte Enter:

```bash
yarn install
```
*(Aguarde alguns minutos. Uma barra de progresso vai aparecer e sumir quando terminar).*

### 5. Coloque o sistema para rodar
Agora que tudo está instalado, digite:

```bash
yarn dev
```

### 6. Acesse no seu navegador
Se tudo deu certo, você verá uma mensagem dizendo algo como `http://localhost:3000`. 
1. Abra seu navegador (Chrome, Edge ou Firefox).
2. Na barra de endereços, digite: **`localhost:3000`** e dê Enter.
3. 🎉 **Pronto! O sistema Izipis está rodando.**

---

## 🔐 Como Acessar (Login)

Para testar o sistema, use as seguintes credenciais:

*   **Administrador (Painel de Controle):**
    *   **E-mail:** `admin@izipis.com`
    *   **Senha:** `123456` (ou qualquer senha)
*   **Operador de Caixa (PDV):**
    *   **E-mail:** `joao@izipis.com`
    *   **Senha:** `123`

---

## ✨ Principais Funcionalidades

1.  **Frente de Caixa (PDV)**: Simula um caixa de supermercado real. Use o leitor de código de barras ou digite o código (ex: `78910001`) e aperte **Enter** para adicionar itens.
2.  **Gestão de Estoque**: No painel do Admin, você pode cadastrar novos produtos, editar preços e ver quais itens estão acabando.
3.  **Integração iFood (Simulada)**: No Dashboard, você pode clicar em "Sincronizar iFood" para ver como pedidos online chegam e dão baixa no seu estoque automaticamente.
4.  **Persistência de Dados**: Tudo o que você fizer (vendas, cadastro de produtos) ficará salvo no seu navegador mesmo se você fechar a aba!

---

## 🛠️ Tecnologias Usadas
Este projeto foi construído com as tecnologias mais modernas do mercado:
*   **Next.js**: O motor principal do sistema.
*   **React**: Para criar as telas interativas.
*   **Tailwind CSS**: Para deixar o visual bonito e profissional.
*   **Framer Motion**: Para as animações suaves.

---
*Desenvolvido com carinho para o projeto de Engenharia de Requisitos.*
