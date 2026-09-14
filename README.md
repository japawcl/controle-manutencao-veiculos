# Controle de Manutenção de Veículos

Sistema web para registrar e acompanhar as manutenções feitas em veículos: qual serviço foi executado, em qual veículo, com que quilometragem, em qual oficina e quanto custou.

## Integrante

- Guilherme Wanderley

> Trabalho realizado individualmente, com a stack em TypeScript autorizada pelo professor no lugar de Java/Spring Boot. A estrutura segue o mesmo padrão MVC pedido no enunciado: Controllers recebem as requisições, um Service guarda os dados em memória e o Model é enviado para os templates.

## Tecnologias

- **TypeScript** — linguagem
- **NestJS** — framework backend (Controllers, Modules, injeção de dependência)
- **Express** — servidor HTTP por trás do Nest
- **Handlebars (hbs)** — motor de templates
- **HTML, CSS e JavaScript** — camada de apresentação

Os dados ficam apenas em memória enquanto a aplicação está rodando. Não há banco de dados, ORM nem autenticação.

## Como executar

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run start:dev
```

Ou, compilando antes:

```bash
npm run build
npm start
```

A aplicação fica disponível em:

```
http://localhost:3000
```

As páginas não são abertas diretamente como arquivos `.html` — todas são servidas pelos Controllers.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Painel com totais, últimos serviços e quilometragem dos veículos |
| GET | `/manutencoes` | Listagem de todas as manutenções |
| GET | `/manutencoes/nova` | Formulário de cadastro |
| POST | `/manutencoes` | Recebe o formulário, grava em memória e redireciona para a listagem |
| GET | `/manutencoes/:id` | Detalhes de uma manutenção |
| GET | `/veiculos` | Listagem dos veículos com km atual e gasto acumulado |

## Estrutura do projeto

```
src/
├── main.ts                      configuração do servidor, views, static e helpers
├── app.module.ts                módulo raiz
├── dashboard.controller.ts      rota /
├── veiculos/
│   ├── veiculo.model.ts
│   ├── veiculos.service.ts      lista de veículos em memória
│   └── veiculos.controller.ts
└── manutencoes/
    ├── manutencao.model.ts      entidade + DTO do formulário
    ├── manutencoes.service.ts   lista de manutenções em memória
    └── manutencoes.controller.ts

views/                           templates Handlebars
├── layout.hbs                   layout base reaproveitado por todas as telas
├── index.hbs
├── partials/menu.hbs            menu de navegação
├── manutencoes/
│   ├── lista.hbs
│   ├── nova.hbs
│   └── detalhes.hbs
└── veiculos/lista.hbs

public/                          arquivos estáticos
├── css/style.css
└── js/app.js                    filtro de texto nas tabelas
```

## Fluxo do formulário

```
GET /manutencoes/nova
   ↓
formulário preenchido
   ↓
POST /manutencoes
   ↓
ManutencoesController
   ↓
ManutencoesService (array em memória)
   ↓
redirect 302
   ↓
GET /manutencoes com a lista atualizada
```

Ao salvar, a quilometragem do veículo é atualizada automaticamente se o valor informado for maior que o registrado.

## Equivalência com Spring Boot

| Spring Boot | Este projeto |
|---|---|
| `@Controller` | `@Controller()` |
| `@GetMapping("/rota")` | `@Get('rota')` |
| `model.addAttribute(...)` | objeto retornado pelo método + `@Render()` |
| `src/main/resources/templates` | `views/` |
| `src/main/resources/static` | `public/` |
| `th:each` | `{{#each}}` |
| `th:text` | `{{variavel}}` |
| `@Service` | `@Injectable()` |
