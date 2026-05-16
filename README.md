# Pizzada do Roger - Frontend

Interface web moderna desenvolvida em React para o sistema de pedidos de pizza.

## 🚀 Tecnologias

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts (gráficos)
- Lucide React (ícones)

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🔧 Instalação

1. **Entre na pasta do frontend:**
```bash
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o `.env` se necessário para apontar para sua API:
```
VITE_API_URL=http://localhost:8000
```

## ▶️ Executando

```bash
npm run dev
```

O aplicativo estará disponível em: `http://localhost:3000`

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos buildados estarão na pasta `dist/`

## 🚢 Deploy no Vercel

1. Faça push do código para o GitHub
2. Acesse https://vercel.com
3. Importe seu repositório
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** npm run build
   - **Output Directory:** dist
5. Adicione a variável de ambiente:
   - `VITE_API_URL`: URL da sua API em produção
6. Deploy!

## 📱 Funcionalidades

### Para Todos os Usuários:
- ✅ Login e Registro
- ✅ Dashboard em tempo real
- ✅ Visualização de pizzas (gráficos)
- ✅ Fazer pedidos
- ✅ Ver oportunidades para completar pizzas
- ✅ Ver meu pedido

### Para Administradores:
- ✅ CRUD de sabores de pizza
- ✅ Gerenciar eventos
- ✅ Ver todos os pedidos
- ✅ Estatísticas completas

## 🎨 Paleta de Cores

- **Primary (Vermelho):** #E63946
- **Secondary (Amarelo):** #F4A261
- **Light (Creme):** #F1FAEE
- **Dark (Cinza):** #1D3557
- **Accent (Azul):** #457B9D

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços de API
│   ├── contexts/       # Contextos React
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Ponto de entrada
│   └── index.css       # Estilos globais
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🐛 Troubleshooting

**Erro de conexão com API:**
- Verifique se o backend está rodando
- Verifique a variável `VITE_API_URL` no `.env`

**Erro ao instalar dependências:**
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

**Gráficos não aparecem:**
- Verifique se há dados no evento ativo
- Verifique o console do navegador

## 📄 Licença

Este projeto é privado e de uso interno.
