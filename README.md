## 📃 Sobre o Projeto

Este é o **frontend** do sistema **multi-tenant** Éden, desenvolvido com **React.js** e **TypeScript**. A aplicação oferece uma interface moderna e responsiva para gerenciamento de lojas, produtos, clientes, funcionários, orçamentos e controle financeiro, com isolamento de dados por loja.

**Arquitetura multitenant**: cada loja possui sua própria interface personalizada com dados isolados, garantindo segurança e privacidade entre diferentes estabelecimentos comerciais.

**Tecnologias principais**:
- <img height="20" width="25" src="https://skillicons.dev/icons?i=react" alt="React"> React.js 19 (Frontend Framework)
- <img height="20" width="25" src="https://skillicons.dev/icons?i=ts" alt="TypeScript"> TypeScript
- <img height="20" width="25" src="https://skillicons.dev/icons?i=tailwind" alt="TailwindCSS"> TailwindCSS v4 (Estilização)
- <img height="20" width="25" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" alt="Axios"> Axios (Requisições HTTP)
- <img height="20" width="25" src="https://skillicons.dev/icons?i=vite" alt="Vite"> Vite (Build Tool)
- 🎨 Radix UI (Componentes Primitivos)
- 📊 Recharts (Gráficos e Visualizações)

## 📂 Estrutura de Pastas

```
/EDEN
├── node_modules/             # Dependências do projeto
├── public/                   # Arquivos públicos estáticos
│
├── src/
│   ├── @types/               # Definições de tipos TypeScript
│   │
│   ├── assets/               # Recursos estáticos (imagens, ícones, etc.)
│   │
│   ├── component/            # Componentes reutilizáveis
│   │
│   ├── components/           # Componentes específicos
│   │   └── ui/               # Componentes de interface (Radix UI)
│   │
│   ├── contexts/             # Contextos React
│   │
│   ├── hook/                 # Hooks customizados (singular)
│   │
│   ├── hooks/                # Hooks customizados (plural)
│   │
│   ├── lib/                  # Bibliotecas e utilitários
│   │
│   ├── pages/                # Páginas da aplicação
│   │   ├── caixa/            # Página de caixa
│   │   ├── estoque/          # Página de estoque
│   │   ├── Home/             # Página inicial
│   │   ├── orcamentos/       # Página de orçamentos
│   │   └── signin/           # Página de login
│   │
│   ├── routes/               # Configuração de rotas
│   │
│   ├── services/             # Serviços e requisições API
│   │
│   ├── utils/                # Funções utilitárias
│   │
│   ├── App.css               # Estilos do componente App
│   ├── App.tsx               # Componente principal da aplicação
│   └── main.tsx              # Ponto de entrada da aplicação
│
├── .gitignore                # Arquivos ignorados pelo Git
├── .prettierrc               # Configuração do Prettier
├── components.json           # Configuração de componentes
├── eslint.config.js          # Configuração do ESLint
├── index.html                # Template HTML principal
├── package-lock.json         # Lock das dependências
├── package.json              # Dependências e scripts
├── README.md                 # Documentação do projeto
├── tsconfig.app.json         # Configuração TypeScript para app
├── tsconfig.json             # Configuração principal do TypeScript
├── tsconfig.node.json        # Configuração TypeScript para Node
├── vite.config.ts           # Configuração do Vite
└── yarn.lock                 # Lock das dependências (Yarn)
```

## 🚀 Começando

### 1. Clonar o repositório

```bash
git clone https://github.com/warlleyrocha/eden.git
```

### 2. Instalar dependências

**Opção 1 - Usando Yarn (recomendado):**
```bash
yarn install
```

**Opção 2 - Usando NPM:**
```bash
npm install --legacy-peer-deps
```

> **Nota:** O projeto foi desenvolvido com Yarn. Se usar NPM, a flag `--legacy-peer-deps` é necessária para resolver conflitos de dependências.

### 3. Iniciar o projeto

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🔢 Scripts disponíveis

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Linting e correção de código
npm run lint
```

## 🗕️ Funcionalidades principais

- **Sistema de componentes** robusto com Radix UI primitivos
- **Formulários validados** com React Hook Form + Zod
- **Tabelas avançadas** com TanStack Table (sorting, filtering, pagination)
- **Gráficos interativos** com Recharts para dashboards
- **Gestão de estado** com Context API e hooks customizados
- **Roteamento** com React Router DOM v6
- **Tema dinâmico** (claro/escuro) com next-themes
- **Notificações** elegantes com Sonner
- **Carousels** e sliders com Embla Carousel
- **Validação robusta** de formulários com Zod schemas

## 📱 Páginas Principais

| Página           | Descrição                                      | Rota Principal           |
|------------------|-----------------------------------------------|--------------------------|
| **Login**        | Autenticação de usuários                      | `/Sigin`                 |
| **Home**         | Visão geral e métricas da loja                | `/Home`                  |
| **Caixa**        | Controle de entradas/saídas e relatórios      | `/caixa`                 |
| **Estoque**      | Gestão de produtos e controle de estoque      | `/estoque`               |
| **Orçamentos**   | Criação e aprovação de orçamentos             | `/orcamentos`            |
| **Clientes**     | Cadastro e histórico de clientes              | `/clientes`              |

## 🎨 Customização Visual

O projeto utiliza **TailwindCSS v4** e **Radix UI** para uma experiência visual moderna:

- **Sistema de Design** consistente baseado em Radix UI primitivos
- **Componentes acessíveis** seguindo padrões WAI-ARIA
- **TailwindCSS v4** com novas funcionalidades e performance otimizada  
- **Temas personalizáveis** com suporte a modo escuro via next-themes
- **Animações fluidas** com CSS nativo e bibliotecas especializadas
- **Responsividade completa** para todos os dispositivos
- **Tipografia consistente** e hierarquia visual clara

## 📦 Deploy

O projeto pode ser deployado em qualquer serviço de hospedagem estática:

- **Vercel** (recomendado para React)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

### Build de produção:

```bash
npm run build
```

## 🚧 Autores

- **Thiago Morgado** - *Desenvolvedor Frontend*
  - Responsável pela criação, estilização e design das telas
  - GitHub: [morgadothiago](https://github.com/morgadothiago)
  - Email: [add](mailto:ameglevr@gmail.com)

- **Ana Gomes** - *Desenvolvedor Frontend* 
  - Responsável pela estilização e design das telas
  - GitHub: [devanaclimgo](https://github.com/devanaclimgo)
  - Email: [anaclimgo@gmail.com](anaclimgo@gmail.com)

- **Warlley Rocha** - *Desenvolvedor Frontend*
  - Responsável pelas requisições e integração com backend
  - GitHub: [warlleyrocha](https://github.com/warlleyrocha)
  - Email: [warlleyrocha@icloud.com](warlleyrocha@icloud.com)

## 🔗 Repositórios Relacionados

- **Backend**: [backendEden](https://github.com/Ameglebm/backendNexStore)
- **Landing Page**: [LandingPage Eden](/) *(em desenvolvimento)*
