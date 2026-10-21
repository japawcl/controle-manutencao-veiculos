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
5. Abra `manutencoes.service.ts`: valida o veículo, as peças e define Agendada como status inicial.
6. Abra `manutencoes.repository.ts`: Repository e QueryBuilder acessam os dados.
7. Abra `manutencao.entity.ts`: veículo é um objeto e peças são uma coleção.
8. Veja as FKs e a tabela associativa nas migrations V3/V4.
9. Volte ao Controller: sucesso faz redirect e mensagem flash; erro devolve os dados preenchidos.
10. Mostre a listagem: o Handlebars repete as linhas com os dados reais.

## Regras demonstráveis

- Nova manutenção começa Agendada, mesmo que a requisição tente outro status.
- Somente Agendada, Em andamento e Concluída são aceitos.
- Concluída não volta para Agendada.
- Quilometragem não retrocede no fluxo sequencial; editar veículo também rejeita redução.
- Peças inexistentes ou IDs malformados impedem salvar a manutenção.
- Nome de peça deve ser único, com proteção no banco e mensagem amigável.
- Veículo com manutenção ou peça utilizada não pode ser excluído.
- Excluir manutenção remove os vínculos e preserva veículo e catálogo de peças.
- Erros de campos e de relacionamento preservam os dados do formulário.

## Comandos e configuração

1. Usar Node 22+ (recomendado 24 LTS), npm e PostgreSQL.
2. Criar banco de desenvolvimento e copiar `.env.example` para `.env`.
3. Executar `npm ci`, `npm test` e `npm run start:dev`.
4. Iniciar a aplicação aplica migrations pendentes, incluindo V6. Em banco com dados antigos inválidos, revisar esses dados antes de aplicar as novas constraints.
5. Após iniciar, executar `npm run schema:check` para a verificação explícita, somente leitura.

`synchronize:false` não é o mesmo que `ddl-auto=validate`. O comando de schema confere tabelas/colunas/tipos/nulabilidade/tamanhos e migrations pendentes, mas não compara todas as constraints automaticamente.

## Verificações executadas nesta implementação

- Compilação TypeScript aprovada.
- Oito testes automatizados de validação e regras aprovados por `npm test`.
- Testes HTTP com uma instância temporária de PostgreSQL 18, separada do banco do aluno.
- Seis migrations aplicadas em banco vazio; segunda inicialização sem duplicação.
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

A implementação não adicionou controle transacional/concorrente às operações que salvam manutenção e odômetro separadamente. A regra de quilometragem foi testada no fluxo sequencial. Antes de uso com múltiplos usuários e dados reais, essas operações devem receber uma estratégia de transação e concorrência.

A instalação das dependências existentes sinalizou cinco vulnerabilidades (duas altas, três críticas). Não foi aplicada atualização automática com possíveis mudanças incompatíveis. Esse resultado deve ser analisado separadamente com `npm audit`.

As alterações ficam locais até revisão e envio ao GitHub. Não foi feito commit, push ou alteração no banco PostgreSQL pessoal do aluno.
