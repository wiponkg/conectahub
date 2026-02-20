# ConectaHub 

**ConectaHub** é uma plataforma moderna de comunicação corporativa e engajamento de comunidade, projetada para conectar colaboradores, promover a cultura organizacional e gamificar a experiência no ambiente de trabalho.

---

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Estrutura](#-arquitetura-e-estrutura)
- [Configuração e Instalação](#-configuração-e-instalação)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Contribuição](#-contribuição)

---

## Sobre o Projeto

O ConectaHub nasceu da necessidade de centralizar a comunicação interna e aumentar o engajamento através de elementos de gamificação. A plataforma oferece um ambiente seguro e intuitivo onde usuários podem acompanhar missões, participar de quizzes, visualizar rankings e gerenciar seu perfil profissional.

---

##  Principais Funcionalidades

-  **Autenticação Segura**: Login e registro com verificação de e-mail via Firebase Auth.
-  **Dashboard Interativo**: Visão geral de pontos, missões e atividades recentes.
-  **Gamificação (Ranking)**: Sistema de pontuação e ranking para incentivar a participação.
-  **Quizzes e Missões**: Desafios interativos para aprendizado e engajamento.
-  **Calendário de Eventos**: Acompanhamento de datas importantes e eventos da empresa.
-  **Perfil do Usuário**: Personalização de avatar, bio e informações profissionais.
-  **Tema Dark/Light**: Suporte nativo para modo escuro e claro.
-  **Onboarding Tour**: Guia interativo para novos usuários conhecerem a plataforma.

---

##  Tecnologias Utilizadas

### Frontend
- **React 18** (Hooks, Context API)
- **TypeScript** (Tipagem estática para maior segurança)
- **Vite** (Build tool ultra-rápida)
- **Tailwind CSS** (Estilização moderna e responsiva)
- **Lucide React** (Ícones elegantes)

### Backend & Infra
- **Firebase Auth** (Gerenciamento de usuários)
- **Cloud Firestore** (Banco de dados NoSQL em tempo real)
- **Firebase Hosting** (Hospedagem otimizada)

---

##  Arquitetura e Estrutura

```text
src/
├── components/     # Componentes reutilizáveis e páginas
├── lib/            # Configurações de serviços externos (Firebase)
├── types/          # Definições de tipos TypeScript
├── App.tsx         # Componente principal e roteamento
├── index.css       # Estilos globais e Tailwind
└── main.tsx        # Ponto de entrada da aplicação
```

---

##  Configuração e Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/conectahub.git
   cd conectahub
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto com suas credenciais do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

---

##  Configuração do Firebase

Para que o projeto funcione corretamente, você precisa configurar o Firebase:

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2. Ative o **Authentication** (E-mail/Senha).
3. Crie um banco de dados **Firestore** em modo de produção ou teste.
4. Adicione as regras de segurança apropriadas para a coleção `users`.
5. Obtenha as credenciais da Web App e adicione ao seu arquivo `.env`.

---

##  Contribuição

Contribuições são sempre bem-vindas!

1. Faça um **Fork** do projeto.
2. Crie uma **Branch** para sua feature (`git checkout -b feature/NovaFeature`).
3. Faça o **Commit** de suas alterações (`git commit -m 'Adicionando nova feature'`).
4. Faça o **Push** para a Branch (`git push origin feature/NovaFeature`).
5. Abra um **Pull Request**.

---

<p align="center">Feito com ❤️ pela equipe ConectaHub</p>
