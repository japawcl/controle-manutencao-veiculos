# Controle de Manutenção de Veículos

Sistema web para registrar e acompanhar as manutenções feitas em veículos: qual serviço foi executado, em qual veículo, com que quilometragem, em qual oficina, quais peças foram usadas e quanto custou.

## Integrantes

- Guilherme Wanderley
- Petrus Yedo

> Trabalho realizado com a stack em TypeScript autorizada pelo professor no lugar de Java/Spring Boot. A arquitetura segue as mesmas camadas pedidas em aula: Controller recebe a requisição, Service concentra as regras de negócio, Repository acessa os dados, as entidades são mapeadas por ORM e o banco evolui por migrations versionadas.

## Tecnologias

- **TypeScript** — linguagem
- **NestJS** — framework backend (Controllers, Modules, Services, injeção de dependência)
- **Express** — servidor HTTP por trás do Nest
- **TypeORM** — ORM e migrations (equivalente a JPA/Hibernate + Flyway)
- **PostgreSQL** — banco de dados relacional
- **class-validator** — validação no backend (equivalente a Bean Validation)
- **express-session** — mensagens de sucesso/erro que sobrevivem ao redirect
- **Handlebars (hbs)** — motor de templates
- **HTML, CSS e JavaScript** — camada de apresentação

## Como executar

Pré-requisitos: Node.js 18 ou superior e PostgreSQL rodando.

**1. Criar o banco**

```sql
CREATE DATABASE controle_manutencao;
```

**2. Configurar a conexão**

Copie `.env.example` para `.env` e ajuste usuário e senha do seu PostgreSQL:

```
BANCO_HOST=localhost
BANCO_PORTA=5432
BANCO_USUARIO=postgres
BANCO_SENHA=senha
BANCO_NOME=controle_manutencao
SESSAO_SEGREDO=troque-este-valor
```

**3. Instalar e rodar**

```bash
npm install
npm run start:dev
```

Ou, compilando antes:

```bash
npm run build
npm start
```

As migrations são aplicadas automaticamente na inicialização, criando as tabelas e inserindo os dados iniciais. Não é preciso rodar nenhum script de banco à mão.

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
| POST | `/manutencoes` | Valida, grava e redireciona para a listagem |
| GET | `/manutencoes/:id` | Detalhes de uma manutenção |
| GET | `/manutencoes/:id/editar` | Formulário preenchido com os dados atuais |
| POST | `/manutencoes/:id/editar` | Valida, atualiza e redireciona |
| POST | `/manutencoes/:id/status` | Altera apenas o status, aplicando a regra de transição |
| POST | `/manutencoes/:id/excluir` | Exclui o registro e redireciona |
| GET | `/veiculos` | Veículos com km atual, nº de serviços e gasto acumulado |
| GET | `/veiculos/novo` | Formulário de cadastro de veículo |
| POST | `/veiculos` | Valida, grava e redireciona |
| GET | `/pecas` | Catálogo de peças e formulário de cadastro |
| POST | `/pecas` | Valida, grava e redireciona |

## Estrutura do projeto

```
src/
├── main.ts                           servidor, views, static, sessão e helpers
├── app.module.ts                     módulo raiz e conexão com o banco
├── dashboard.controller.ts           rota /
├── banco/
│   ├── data-source.ts                configuração da conexão
│   └── migrations/                   evolução versionada do schema
│       ├── ...-V1CriaVeiculos.ts
│       ├── ...-V2CriaManutencoes.ts
│       ├── ...-V3AdicionaRelacaoVeiculo.ts
│       ├── ...-V4CriaPecas.ts
│       └── ...-V5DadosIniciais.ts
├── comum/
│   ├── validacao.ts                  valida o formulário e devolve erros por campo
│   └── mensagens.ts                  mensagens de sucesso/erro através do redirect
├── veiculos/
│   ├── veiculo.entity.ts             entidade mapeada para a tabela veiculos
│   ├── dto/salvar-veiculo.dto.ts     regras de validação do formulário
│   ├── veiculos.repository.ts        acesso aos dados
│   ├── veiculos.service.ts           regras de negócio
│   └── veiculos.controller.ts        rotas
├── manutencoes/
│   ├── manutencao.entity.ts          entidade + relações 1:N e N:N
│   ├── dto/salvar-manutencao.dto.ts
│   ├── manutencoes.repository.ts
│   ├── manutencoes.service.ts
│   └── manutencoes.controller.ts
└── pecas/
    ├── peca.entity.ts
    ├── dto/salvar-peca.dto.ts
    ├── pecas.repository.ts
    ├── pecas.service.ts
    └── pecas.controller.ts

views/                                templates Handlebars
├── layout.hbs                        layout base reaproveitado por todas as telas
├── index.hbs
├── partials/
│   ├── menu.hbs                      menu de navegação
│   ├── mensagens.hbs                 área de sucesso/erro
│   └── campos.hbs                    campos compartilhados pelos dois formulários
├── manutencoes/
│   ├── lista.hbs
│   ├── nova.hbs
│   ├── editar.hbs
│   └── detalhes.hbs
├── veiculos/
│   ├── lista.hbs
│   └── novo.hbs
└── pecas/lista.hbs

public/                               arquivos estáticos
├── css/style.css
└── js/app.js                         filtro de texto nas tabelas
```

## Camadas

```
navegador
   ↓
Controller      rota, validação do formulário, escolha do template, redirect
   ↓
Service         regras de negócio
   ↓
Repository      acesso aos dados
   ↓
TypeORM
   ↓
PostgreSQL
```

As migrations ficam fora desse fluxo: elas controlam a estrutura do banco, não os registros.

## Modelo de dados

```
veiculos  1 ──── N  manutencoes  N ──── N  pecas
                          │                 │
                          └─ manutencao_pecas ─┘
```

- **1:N** — cada manutenção pertence a um veículo. A chave estrangeira `id_veiculo` fica na tabela `manutencoes`.
- **N:N** — uma manutenção usa várias peças e uma peça aparece em várias manutenções. A tabela associativa `manutencao_pecas` tem chave primária composta (`id_manutencao`, `id_peca`), o que impede vínculos duplicados.

Nenhuma relação apaga em cascata o registro relacionado: excluir uma manutenção não exclui o veículo nem as peças, apenas os vínculos.

## Validação

Cada formulário tem um DTO com as regras declaradas nos próprios campos. Quando a validação falha, não há redirect: a mesma requisição devolve o formulário com os dados já digitados preservados, o campo problemático destacado e a mensagem ao lado dele.

```
POST /manutencoes
      ↓
validação falhou?
      ├── sim → devolve o formulário preenchido + mensagens de erro
      └── não → Service aplica as regras → Repository grava → redirect 302
```

## Regras de negócio

Ficam no Service, não no Controller nem no formulário:

- Toda manutenção nasce com status **"Agendada"** — a aplicação decide, não o usuário.
- Uma manutenção **"Concluída" não volta para "Agendada"**. A tentativa é recusada e o usuário recebe a mensagem de erro.
- O **odômetro do veículo nunca retrocede**: salvar uma manutenção com quilometragem maior que a registrada atualiza o veículo; com quilometragem menor, não altera nada.
- O **nome da peça é único**, verificado antes de gravar e também garantido por `UNIQUE` no banco.

## Migrations

O schema evolui por arquivos numerados, aplicados em ordem e registrados numa tabela de controle. Uma migration já aplicada nunca é editada: toda mudança entra como um arquivo novo.

| Arquivo | O que faz |
|---|---|
| `V1CriaVeiculos` | cria a tabela `veiculos` |
| `V2CriaManutencoes` | cria a tabela `manutencoes` |
| `V3AdicionaRelacaoVeiculo` | adiciona a coluna `id_veiculo` e a chave estrangeira |
| `V4CriaPecas` | cria `pecas` e a tabela associativa `manutencao_pecas` |
| `V5DadosIniciais` | insere os veículos, peças e manutenções de exemplo |

Comandos auxiliares:

```bash
npm run migration:show
```

```bash
npm run migration:run
```

```bash
npm run migration:revert
```

## Equivalência com Java / Spring Boot

| Spring Boot | Este projeto |
|---|---|
| `pom.xml` | `package.json` |
| `application.properties` | `.env` + `src/banco/data-source.ts` |
| `@Controller` | `@Controller()` |
| `@GetMapping("/rota")` | `@Get('rota')` |
| `@PostMapping("/rota")` | `@Post('rota')` |
| `@PathVariable Long id` | `@Param('id', ParseIntPipe) id: number` |
| `model.addAttribute(...)` | objeto retornado pelo método + `@Render()` |
| `redirect:/rota` | `resposta.redirect(302, '/rota')` |
| `RedirectAttributes.addFlashAttribute` | mensagem na sessão (`src/comum/mensagens.ts`) |
| `src/main/resources/templates` | `views/` |
| `src/main/resources/static` | `public/` |
| `th:each` | `{{#each}}` |
| `th:text` | `{{variavel}}` |
| `th:href="@{/rota/{id}}"` | `href="/rota/{{this.id}}"` |
| `th:action="@{/rota}"` | `action="/rota"` |
| `th:object` / `th:field` | `name="campo"` + `value="{{objeto.campo}}"` |
| `th:errors` | `{{erros.campo}}` |
| `th:errorclass` | `class="{{#if erros.campo}}campo-erro{{/if}}"` |
| `@Service` | `@Injectable()` |
| JPA / Hibernate | TypeORM |
| `@Entity` / `@Table(name=...)` | `@Entity('tabela')` |
| `@Id @GeneratedValue(IDENTITY)` | `@PrimaryGeneratedColumn()` |
| `@Column(nullable = false)` | `@Column({ nullable: false })` |
| `@ManyToOne` + `@JoinColumn` | `@ManyToOne` + `@JoinColumn` |
| `@ManyToMany` + `@JoinTable` | `@ManyToMany` + `@JoinTable` |
| `JpaRepository<Chamado, Long>` | classe que herda `Repository<Manutencao>` |
| `save()` / `findAll()` / `findById()` / `deleteById()` | `save()` / `find()` / `findOne()` / `delete()` |
| `Optional<Chamado>` | `Manutencao` ou `null` |
| Bean Validation (`@NotBlank`, `@Size`) | class-validator (`@IsNotEmpty`, `@Length`) |
| `@Valid` + `BindingResult` | `validarFormulario()` (`src/comum/validacao.ts`) |
| Flyway (`V1__create.sql`) | migrations do TypeORM em `src/banco/migrations` |
| `spring.jpa.hibernate.ddl-auto=validate` | `synchronize: false` |
| `http://localhost:8080` | `http://localhost:3000` |
