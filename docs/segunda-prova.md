# Segunda prova — implementação e roteiro de estudo

## Escopo

A primeira prova corresponde à integração do protótipo com backend e templates. Esta versão consolida os conteúdos enviados até a Aula 16, mantendo TypeScript/NestJS/Handlebars como adaptação autorizada de Java/Spring Boot/Thymeleaf.

Exemplos de domínio (Chamado, Cliente, Tag) correspondem a Manutenção, Veículo e Peça. Alternativas apresentadas como UUID, armazenamento temporário em memória e relação bidirecional não precisam coexistir com a solução final; o que foi ensinado é explicado abaixo sem substituir a persistência por memória nem duplicar o sistema em Java.

## Cobertura de todas as apresentações

| Material | Conteúdo demonstrado | Arquivos principais |
|---|---|---|
| Aula 1 | Aplicação integrada, navegador/servidor/banco, request/response | `src/main.ts`, `src/app.module.ts` |
| Aula 2 | Documento HTML, idioma, metadados, títulos, imagem, links, lista e conteúdo expansível | `views/layout.hbs`, `views/index.hbs`, `public/img/veiculo.svg` |
| Aula 3 | Header, nav, main, sections, footer e tabela de dados | `views/layout.hbs`, `views/index.hbs`, `views/partials/menu.hbs` |
| Atividade 3.1 | Apresentação, funcionalidades, três ou mais seções, tabela com quatro colunas e dados de exemplo, imagem e rodapé | `views/index.hbs`, migration V5 |
| Aula 4 | Formulários, action/method/name, labels, text/date/number, select, textarea, fieldset e checkbox | `views/partials/campos.hbs`, `views/veiculos/novo.hbs` |
| Atividade 4.1 | Cadastro por POST, campos associados por for/id e validação HTML | `views/partials/campos.hbs`, `views/veiculos/novo.hbs` |
| Aula 5 | CSS externo, seletores, espaçamento, botões, tabelas, Flexbox e estados | `public/css/style.css` |
| Aula 6 | JS externo com defer, eventos, validação visual, classList, mensagens, confirm, contador e filtro | `public/js/app.js`, `views/layout.hbs` |
| Aula 7 | Entrada da aplicação, servidor, Controllers, templates e estáticos | `src/main.ts`, `src/app.module.ts`, `views/`, `public/` |
| Aula 8 | Rotas, dados no template, repetição, condições e links | Controllers e templates de cada domínio |
| Aula 9 | Objetos, formulário GET, recebimento POST e redirect | DTOs e controllers; persistência substitui a fase em memória |
| Aula 10 | IDs, parâmetros da URL, detalhes e exclusão por POST | Controllers, entidades e templates `detalhes.hbs` |
| Aula 11 | CRUD, edição de registro existente, feedback flash e ID inexistente | Controllers, services, `src/comum/mensagens.ts` |
| Aula 12 | ORM, entidades, ID gerado, PostgreSQL e migrations | Entidades, `src/banco/`, `scripts/verificar-schema.cjs` |
| Aula 13 | Repository, injeção por construtor e persistência após reiniciar | Repositories e services |
| Aula 14 | Validação backend, mensagens por campo, formulário preservado e schema coerente | DTOs, `src/comum/validacao.ts`, `transformacoes.ts` |
| Aula 15 | Service, regra de status inicial, transição bloqueada e coordenação de entidades | `src/manutencoes/manutencoes.service.ts` |
| Aula 16 | ManyToOne/FK, ManyToMany/tabela associativa, seleção e edição de relações | `manutencao.entity.ts`, migrations V3/V4, partial `campos.hbs` |

As expressões `th:text`, `th:each`, `th:href`, `th:action`, `th:object` e `th:field` correspondem a valores Handlebars, blocos `each`, links com IDs e valores/seleções preenchidos a partir dos objetos enviados pelo Controller. O backend recebe o formulário por `@Body`; `validarFormulario` transforma e valida o DTO.

`@Service` corresponde aos providers `@Injectable`; `@PathVariable` a `@Param`; `BindingResult` ao resultado `{ dados, erros, temErros }`; flash attributes às mensagens temporárias na sessão. As tecnologias cumprem papéis equivalentes, mas não são APIs ou garantias idênticas.

`List<Objeto>` foi uma etapa intermediária: a versão atual recebe arrays do Repository, cujos registros estão no banco. O contador manual de ID foi substituído pelo BIGSERIAL. UUID é uma alternativa explicada nas aulas, não uma exigência de trocar o identificador existente. `article` e `aside` são alternativas semânticas conforme o conteúdo; não há necessidade de inserir todas as tags demonstradas sem um significado correspondente.

A primeira entrega pede no mínimo cinco páginas; a versão atual possui painel, cadastro/listagem/detalhes/edição de manutenção, cadastro/listagem/detalhes/edição de veículos e listagem/cadastro/detalhes/edição de peças (cadastro e listagem de peças na mesma tela).

## Fluxo para aprender e apresentar

1. Abra `views/manutencoes/nova.hbs`: o formulário usa POST e reaproveita `partials/campos.hbs`.
2. Abra `manutencoes.controller.ts`: a rota recebe os campos e chama a validação.
3. Abra `salvar-manutencao.dto.ts`: os decorators definem dados aceitos.
4. Abra `comum/transformacoes.ts`: texto é normalizado e vazio numérico não vira zero.
5. Abra `manutencoes.service.ts`: valida o veículo, as peças e define Agendada para agendamento ou Concluída para histórico, validando a data.
6. Abra `manutencoes.repository.ts`: Repository e QueryBuilder acessam os dados.
7. Abra `manutencao.entity.ts`: veículo é um objeto e peças são uma coleção.
8. Veja as FKs e a tabela associativa nas migrations V3/V4.
9. Volte ao Controller: sucesso faz redirect e mensagem flash; erro devolve os dados preenchidos.
10. Mostre a listagem: o Handlebars repete as linhas com os dados reais.

## Regras demonstráveis

- Novo agendamento começa Agendada; serviço já realizado começa Concluída, com data até hoje.
- Somente Agendada, Em andamento e Concluída são aceitos.
- Status não retrocede: Concluída não volta para Em andamento nem Agendada.
- Conclusão salva manutenção e odômetro em uma transação, com máximo atômico; editar veículo também rejeita redução.
- Peças inexistentes ou IDs malformados impedem salvar a manutenção.
- Nome de peça deve ser único, com proteção no banco e mensagem amigável.
- Veículo com manutenção ou peça utilizada não pode ser excluído.
- Excluir manutenção remove os vínculos e preserva veículo e catálogo de peças.
- Erros de campos e de relacionamento preservam os dados do formulário.

## Comandos e configuração

1. Usar Node 22+ (recomendado 24 LTS), npm e PostgreSQL.
2. Criar banco de desenvolvimento e copiar `.env.example` para `.env`.
3. Executar `npm ci`, `npm test` e `npm run start:dev`.
4. Iniciar a aplicação aplica migrations pendentes, incluindo V6 e V7. Em banco com dados antigos inválidos, revisar esses dados antes de aplicar as novas constraints.
5. Após iniciar, executar `npm run schema:check` para a verificação explícita, somente leitura.

`synchronize:false` não é o mesmo que `ddl-auto=validate`. O comando de schema confere tabelas/colunas/tipos/nulabilidade/tamanhos e migrations pendentes, mas não compara todas as constraints automaticamente.

## Verificações executadas nesta implementação

- Compilação TypeScript aprovada.
- 17 testes automatizados de validação, regras e demonstração aprovados por `npm test`.
- Testes HTTP com uma instância temporária de PostgreSQL 18, separada do banco do aluno.
- Sete migrations aplicadas em banco vazio; segunda inicialização sem duplicação.
- Quinze rotas e recursos retornando resposta válida.
- Cadastros, edição com múltiplas peças, bloqueio de status e relações inválidas, peça duplicada e odômetro decrescente verificados.
- Exclusões vinculadas bloqueadas; exclusão de manutenção preservando entidades relacionadas verificada.
- Persistência após reiniciar o servidor confirmada.
- Verificação explícita de schema aprovada.
- Conferência visual e interação no navegador não concluídas: a ferramenta de navegador não retornou uma tela utilizável. Os recursos JS/CSS foram servidos nos testes HTTP, mas isso não comprova a interação visual.

## Checklist manual antes da prova

- Abrir painel e novas telas; conferir aparência no computador e em janela estreita.
- Enviar formulário vazio e verificar mensagem, classe de erro e foco.
- Digitar descrição e conferir contador; filtrar tabela.
- Cancelar e confirmar exclusão de um registro criado exclusivamente para demonstração.
- Enviar edição inválida e verificar manutenção dos campos/seleções.
- Cadastrar manutenção, editar veículo associado, marcar/desmarcar peças e consultar o resultado no pgAdmin.
- Reiniciar e mostrar os mesmos registros persistidos.
- Explicar a separação entre DTO, Service, Repository e migration.

## Limites de escopo

Não foram acrescentados login, Docker, deploy, frontend separado ou UUID como obrigação: o material os dispensa ou apresenta como alternativa. Os exemplos de relatórios e autenticação da introdução não constituem, sozinhos, enunciados para implementar esses módulos.

Manutenção e atualização do odômetro agora são salvas na mesma transação. O odômetro é atualizado somente em serviços concluídos, com comparação atômica que impede uma leitura menor de sobrescrever uma maior.

A instalação das dependências existentes sinalizou cinco vulnerabilidades (duas altas, três críticas). Não foi aplicada atualização automática com possíveis mudanças incompatíveis. Esse resultado deve ser analisado separadamente com `npm audit`.

As alterações ficam locais até revisão e envio ao GitHub. Não foi feito commit, push ou alteração no banco PostgreSQL pessoal do aluno.


## Atualização: demonstração sem servidor PostgreSQL

Para visualizar com facilidade, use `npm.cmd ci` (uma vez após clonar) e `npm.cmd run demo`. O SQLite local é preparado automaticamente e persiste em `.dados/demo.sqlite`, sem senha e sem `.env`. O comando padrão `start:dev` continua utilizando PostgreSQL.

Na apresentação, identifique qual modo está ativo. O rodapé informa o modo de demonstração. Para explicar os conteúdos específicos de PostgreSQL, mostre a configuração e as migrations originais, sem afirmar que SQLite é PostgreSQL.

O teste integrado da demonstração verifica quinze rotas/recursos, CRUD, status, unicidade, bloqueio de exclusão vinculada e persistência após reiniciar. A suíte agora contém 17 testes. O código do modo local é independente dos antigos arquivos temporários de teste do Codex e pode ser clonado normalmente junto do projeto.


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
