# 📦 Izipis - Sistema de Gestão para Mercados

Bem-vindo ao **Izipis**! Este é um sistema moderno e premium de gestão de estoque, controle de recebimento e frente de caixa (PDV) desenvolvido para otimizar a operação de pequenos e médios mercados. O sistema conta ainda com uma aba inteligente de predições de venda por inteligência artificial (Izipis Predict).

---

## 🚀 Link de Produção (GitHub Pages)
O sistema está publicado e pronto para uso no ambiente de produção:
👉 **[https://engenharia-de-requisitos-cic-5.github.io/Izipis/](https://engenharia-de-requisitos-cic-5.github.io/Izipis/)**

---

## 💻 Como Rodar o Projeto Localmente

Se você deseja executar o projeto em sua máquina local para desenvolvimento ou testes, siga os passos abaixo:

### 1. Pré-requisitos
Instale o **Node.js** em seu computador:
1. Acesse: [nodejs.org](https://nodejs.org/)
2. Baixe e instale a versão **LTS** recomendada para a maioria dos usuários.

### 2. Instalar as Dependências
Abra o terminal do seu sistema (ou prompt de comando) na pasta raiz do projeto e execute:
```bash
yarn install
```
*(Se preferir usar npm, execute `npm install`)*.

### 3. Iniciar o Servidor de Desenvolvimento
Para iniciar a aplicação em modo de desenvolvimento local, rode:
```bash
yarn dev
```
*(Ou `npm run dev`)*.

Abra o seu navegador e acesse: **`http://localhost:3000`**

---

## 🔐 Credenciais de Acesso (Demos)

Para acessar os diferentes módulos do sistema, utilize uma das seguintes contas de teste:

*   **Perfil: Administrador (Dashboard, Estoque, Predict, Relatórios e Recebimento)**
    *   **E-mail:** `admin@izipis.com`
    *   **Senha:** `123456` *(ou qualquer senha superior a 1 caractere)*
*   **Perfil: Operador de Caixa (Frente de Caixa - PDV)**
    *   **E-mail:** `joao@izipis.com`
    *   **Senha:** `123` *(ou qualquer senha superior a 1 caractere)*

---

## ✨ Módulos e Funcionalidades do Sistema

1.  **Frente de Caixa (PDV)**: Uma interface ágil e limpa para registro de vendas rápidas. Permite simular a leitura de código de barras ou digitação direta do SKU (ex: `78910001` para Arroz) e calcular o troco automaticamente.
2.  **Dashboard Principal**: Apresenta os principais KPIs de faturamento bruto, ticket médio, total de transações e um gráfico animado de vendas divididas entre o canal Balcão (PDV) e o canal iFood.
3.  **Auditoria e Histórico de Vendas**: Relatório completo de transações efetuadas com busca dinâmica por ID do cupom ou nome de cliente. É possível visualizar e imprimir a via do cupom fiscal detalhado (cupom de compras).
4.  **Gestão de Estoque**: Painel completo para visualizar produtos cadastrados, quantidade disponível, alerta de estoque baixo (ruptura), preços, e suporte à edição e exclusão de itens.
5.  **Recebimento de Carga**: Módulo dedicado à entrada de notas fiscais e lotes. Permite aos administradores dar entrada em quantidades adicionais de produtos no estoque, informando número do lote e data de validade.
6.  **Izipis Predict (ML)**: Tela inteligente que utiliza algoritmos de regressão e médias históricas para estimar a tendência de vendas futuras de cada categoria de produto e emitir alertas de reabastecimento inteligente com base em sazonalidades de demanda.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído sobre uma arquitetura estática moderna:
*   **Next.js (App Router)**: Framework React com exportação estática (`output: 'export'`) configurado para rodar sob a subpasta do GitHub Pages.
*   **React**: Biblioteca para componentização e reatividade de interface.
*   **Tailwind CSS**: Estilização baseada em utilitários para criar uma interface limpa, responsiva e de alta fidelidade visual.
*   **Framer Motion**: Biblioteca para micro-animações, transições e animação de modais de cupom fiscal.
*   **Lucide React**: Biblioteca de ícones modernos e minimalistas.
*   **LocalStorage**: Armazenamento offline que garante a persistência de novos produtos, estoques e histórico de vendas mesmo após fechar o navegador.

---
*Desenvolvido como projeto prático para a disciplina de Engenharia de Requisitos.*
