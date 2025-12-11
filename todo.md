# Ghibli Movie App - TODO

## Fase 1: Schema e Banco de Dados
- [x] Implementar tabela de favoritos no schema Drizzle
- [x] Criar migrations do banco de dados

## Fase 2: Autenticação
- [x] Implementar tela de Login com integração OAuth
- [x] Implementar tela de Cadastro/Registro (usando OAuth Manus)
- [x] Criar procedimentos tRPC para autenticação
- [ ] Implementar proteção de rotas com autenticação

## Fase 3: Roteamento
- [x] Configurar React Router para navegação multi-página
- [x] Implementar rotas protegidas (Perfil, Favoritos)
- [x] Criar layout de navegação principal
- [x] Implementar redirecionamento de usuários não autenticados

## Fase 4: Componentes Web
- [x] Migrar MovieCard de React Native para React Web
- [x] Criar componente SearchBar para busca de filmes
- [x] Implementar componente de lista de filmes
- [x] Criar componente de detalhes do filme

## Fase 5: Integração com API Ghibli
- [x] Implementar procedimento tRPC para buscar filmes da API Ghibli
- [x] Implementar busca de filmes por título
- [x] Implementar tratamento de erros de API
- [x] Implementar estados de loading

## Fase 6: Sistema de Favoritos
- [x] Implementar procedimento tRPC para adicionar favorito
- [x] Implementar procedimento tRPC para remover favorito
- [x] Implementar procedimento tRPC para listar favoritos do usuário
- [x] Integrar favoritos com componente MovieCard
- [x] Criar página de Perfil/Favoritos

## Fase 7: Estilização e UX
- [x] Aplicar Tailwind CSS para responsividade
- [x] Implementar feedback visual para interações (hover, clique)
- [x] Criar componentes de loading e erro
- [x] Testar responsividade em desktop, tablet e mobile

## Fase 8: Testes
- [x] Escrever testes unitários para componentes de autenticação
- [x] Escrever testes para procedimentos tRPC
- [x] Testar fluxo de autenticação e-2-e
