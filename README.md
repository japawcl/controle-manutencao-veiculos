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

## Visualizar sem PostgreSQL e sem senha

Depois de clonar, dentro da pasta do projeto:

```powershell
npm.cmd ci
npm.cmd run demo
```

Abra o endereço informado no terminal no Chrome ou Edge (padrão: http://localhost:3000). Mantenha o terminal aberto e use Ctrl+C para encerrar. No macOS/Linux use `npm` no lugar de `npm.cmd`.

Este modo usa SQLite via sql.js, instalado pelo npm, sem servidor adicional, sem pgAdmin, sem senha e sem exigir `.env`. Os exemplos são criados automaticamente na primeira execução e os cadastros ficam no arquivo local `.dados/demo.sqlite`. Reiniciar conserva os dados. Esse arquivo está no `.gitignore`: cada computador mantém seu próprio banco.

O SQLite serve para demonstrar as telas e operações. O modo PostgreSQL abaixo continua disponível para os conteúdos específicos da disciplina. Os bancos são independentes: os dados não são transferidos automaticamente entre os modos.

Não execute duas instâncias da demonstração simultaneamente usando o mesmo arquivo. Se a porta estiver ocupada, encerre a instância anterior ou informe outra porta antes de iniciar:

```powershell
$env:PORT = '3001'
npm.cmd run demo
```

## Como executar com PostgreSQL

Pré-requisitos: Node.js 22 ou superior (recomendado: 24 LTS) e PostgreSQL rodando.

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
npm ci
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

- Um novo agendamento nasce **Agendada**; um serviço já realizado nasce **Concluída**. A aplicação decide o status conforme o tipo de registro e valida a data.
- O status só avança; uma manutenção **Concluída não pode ser reaberta**. A tentativa é recusada e o usuário recebe a mensagem de erro.
- O **odômetro do veículo nunca retrocede**: concluir uma manutenção com quilometragem maior atualiza o veículo; agendamentos e leituras menores não alteram o odômetro.
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
| `@Id @GeneratedValue(IDENTITY)` | `@PrimaryGeneratedColumn({ type: 'bigint' })` |
| `@Column(nullable = false)` | `@Column({ nullable: false })` |
| `@ManyToOne` + `@JoinColumn` | `@ManyToOne` + `@JoinColumn` |
| `@ManyToMany` + `@JoinTable` | `@ManyToMany` + `@JoinTable` |
| `JpaRepository<Chamado, Long>` | classe que herda `Repository<Manutencao>` |
| `save()` / `findAll()` / `findById()` / `deleteById()` | `save()` / `find()` / `findOne()` / `delete()` |
| `Optional<Chamado>` | `Manutencao` ou `null` |
| Bean Validation (`@NotBlank`, `@Size`) | class-validator (`@IsNotEmpty`, `@Length`) com normalização dos textos |
| `@Valid` + `BindingResult` | `validarFormulario()` (`src/comum/validacao.ts`) |
| Flyway (`V1__create.sql`) | migrations do TypeORM em `src/banco/migrations` |
| Controle de schema | `synchronize: false` impede sincronização; `npm run schema:check` confere explicitamente a estrutura |
| `http://localhost:8080` | `http://localhost:3000` |


## Segunda prova: cobertura das aulas

A evolução está detalhada em [docs/segunda-prova.md](docs/segunda-prova.md), com os conceitos das aulas 1 a 16, localização no código e roteiro de apresentação.

- CRUD de manutenções, veículos e peças, incluindo detalhes e edição.
- Exclusão de veículos e peças em uso é bloqueada para preservar o histórico.
- Validação HTML, JavaScript externo e backend; textos em branco e números vazios são rejeitados.
- Confirmação de exclusão por evento no JS externo; contador de caracteres e filtro de tabela.
- Validação dos status e dos identificadores das peças; formulário preservado em falhas.
- IDs BIGINT são representados como strings nas entidades para manter a precisão do driver.
- Migration V6 acrescenta constraints e ajusta o odômetro aos registros existentes. Ela não corrige silenciosamente textos/status inválidos legados: esses dados devem ser revisados antes de aplicar as constraints.

Novas rotas (GET): `/veiculos/:id`, `/veiculos/:id/editar`, `/pecas/:id`, `/pecas/:id/editar`.
Novas ações (POST): `/veiculos/:id/editar`, `/veiculos/:id/excluir`, `/pecas/:id/editar`, `/pecas/:id/excluir`.

A porta pode ser configurada por `PORT` no `.env` (padrão: 3000). `start:dev` não reinicia automaticamente: pare e execute de novo depois de alterar TypeScript.

### Verificação

```bash
npm test
npm run schema:check
```

`npm test` compila e executa testes de validação e regras, sem precisar de banco. `schema:check` usa a conexão do `.env`, sem executar migrations nem alterar dados. Confere tabelas, colunas, tipos, nulabilidade, tamanhos e migrations pendentes; não substitui uma inspeção completa de todas as constraints.

As migrations compartilhadas V1–V5 foram preservadas. Não use `migration:revert` indiscriminadamente: o down da V5 original remove registros das tabelas.

### Implementação do modo de demonstração

- `scripts/demo.cjs`: seleciona o modo e cria a pasta local de dados.
- `src/banco/modo-demo.ts`: seleção explícita e tipo de ID por banco.
- `src/banco/data-source.ts`: escolhe SQLite somente quando o launcher define MODO_DEMO=1.
- `src/banco/demo/`: migration SQLite separada e proteção das chaves estrangeiras após salvar o arquivo.
- `tests/demo.test.cjs`: teste HTTP com SQLite temporário, CRUD e persistência após reiniciar. Não exige PostgreSQL.

O schema SQLite usa IDs INTEGER gerados; o PostgreSQL mantém BIGINT e as migrations V1–V6 originais, além da nova V7 de unicidade de placa. SQLite e PostgreSQL não são tecnologias idênticas: a demonstração não substitui apresentar migrations/configuração PostgreSQL quando isso for solicitado pelo professor.

`npm test` agora executa 17 testes, incluindo a demonstração local. A suíte utiliza apenas bancos temporários próprios e não modifica o banco PostgreSQL pessoal.


## Revisão das validações (23/10/2026)

- **Agendar serviço:** permite hoje ou uma data futura, usando o dia de São Paulo. Agendamentos antigos vencidos podem ser corrigidos mantendo sua data original.
- **Serviço já realizado (histórico):** permite hoje ou datas passadas e salva com status Concluída. Não permite concluir ou iniciar um serviço com data futura, seja pela edição ou pela troca de status.
- **Status:** só avança de Agendada para Em andamento/Concluída e de Em andamento para Concluída. Serviços concluídos não podem ser reabertos.
- **Dinheiro:** aceita `100,50`, `100.50`, `1.234,56` e `R$ 100,50`. Rejeita negativos, mais de duas casas, valores acima de R$ 99.999.999,99, hexadecimal e notação científica. `1.234` é ambíguo e é rejeitado; use `1.234,00` para mil duzentos e trinta e quatro reais.
- **Quilometragem:** aceita somente inteiros entre 0 e 2.147.483.647. Agendamentos guardam a previsão sem alterar o odômetro; a conclusão atualiza o odômetro sem diminuí-lo, na mesma transação.
- **Placa:** normalizada em maiúsculas e sem hífen; duplicação é bloqueada no cadastro, edição e banco. A própria placa pode ser mantida na edição.
- **Ano-modelo:** de 1950 até o ano corrente mais um (limite atualizado automaticamente).
- **Peças e veículo:** identificadores devem ser inteiros válidos e corresponder a registros existentes.

A migration V7 (PostgreSQL) e V2DemoPlacaUnica (SQLite) adicionam o índice de placa. Se já existirem placas duplicadas no banco, a atualização informa quais devem ser revisadas e interrompe sem excluir ou mesclar veículos automaticamente. As migrations antigas foram preservadas.

Verificação: 17 testes automatizados aprovados, incluindo HTTP da demonstração, validações, atualização de um arquivo SQLite da versão anterior e persistência. A integração também foi conferida em PostgreSQL temporário, incluindo as sete migrations, as rotas e o schema. A aparência e os eventos no navegador ainda devem ser conferidos manualmente.

Para visualizar no Windows, dentro da pasta do projeto:

```powershell
npm.cmd run demo
```

Abra http://localhost:3000 no seu navegador. Se o servidor já estiver aberto, pare com Ctrl+C antes de iniciar novamente. As mudanças só estarão disponíveis para outras pessoas após commit e push.
