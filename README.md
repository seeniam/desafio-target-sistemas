# Desafio Tecnico - Target Sistemas

Aplicacao em TypeScript/Node.js com interface web React para resolver tres exercicios: comissao de vendedores, movimentacao de estoque e juros por atraso. A CLI original foi preservada para execucao no terminal.

Nao ha API, banco de dados ou autenticacao. As regras de negocio ficam em modulos independentes e sao consumidas tanto pela interface quanto pela CLI.

## Tecnologias

- Node.js 20 ou superior e npm
- TypeScript em modo `strict`
- React, Vite e Tailwind CSS
- Lucide React para icones
- Vitest e Testing Library para testes
- Node.js `readline` para a CLI

## Instalacao

```bash
npm install
```

## Execucao

Interface web em desenvolvimento:

```bash
npm run dev
```

CLI original:

```bash
npm run dev:cli
```

Build completo:

```bash
npm run build
```

Executar a CLI compilada:

```bash
npm start
```

Pre-visualizar o build web:

```bash
npm run preview
```

## Validacao

```bash
npm test
npm run typecheck
npm run build
```

## Estrutura

```text
src/
  app/            aplicacao React, entrada Vite e testes de UI
  components/     componentes visuais compartilhados
  features/       paginas de visao geral, comissoes, estoque e juros
  commissions/    regras de comissoes
  inventory/      servico de estoque e historico
  interest/       calculo de juros por dia civil
  data/           dados iniciais do enunciado
  utils/          conversao e apresentacao monetaria
  index.ts        CLI interativa
tests/            testes de dominio por exercicio
```

## Interface web

A interface "Painel Operacional" organiza os tres modulos em uma experiencia responsiva:

- Visao geral com cards dos modulos.
- Comissoes com KPIs, ranking, visualizacao por vendedor, filtros e tabela.
- Estoque com cards de produtos, painel de movimentacao, feedback e historico.
- Juros com calculadora, estados para vencimento passado, hoje e futuro, alem da explicacao da formula.

## Regras de negocio

### 1. Comissao de vendedores

Cada venda e transformada em centavos, classificada e tem sua comissao arredondada ao centavo antes da soma por vendedor.

- Abaixo de R$100,00: 0%.
- R$100,00 ate R$499,99: 1%.
- A partir de R$500,00: 5%.
- A comissao e calculada por venda antes da agregacao por vendedor.

### 2. Estoque

O servico mantem os produtos em memoria durante a execucao. Cada movimentacao registra identificador, produto, tipo, quantidade, descricao, estoque anterior e estoque final.

Validacoes:

- Produto precisa existir.
- Tipo precisa ser `ENTRADA` ou `SAIDA`.
- Quantidade precisa ser inteira maior que zero.
- Descricao e obrigatoria.
- Saida nao pode gerar estoque negativo.
- Identificador de movimentacao precisa ser unico.

### 3. Juros por atraso

O exercicio foi interpretado como juros simples de 2,5% ao dia:

```text
juros = valor x 0,025 x diasEmAtraso
valorAtualizado = valor + juros
```

Datas sao strings de dia civil no formato `AAAA-MM-DD`, validadas estritamente e convertidas com `Date.UTC`. A funcao de dominio aceita uma data de referencia opcional para manter os testes deterministicos. Vencimento hoje ou futuro produz zero dia de atraso e zero juros.

## Decisoes tecnicas

- Valores monetarios sao armazenados em centavos inteiros e formatados como BRL somente na saida.
- A UI chama os modulos de dominio ja validados; regras de comissao, estoque e juros nao foram duplicadas nos componentes.
- A CLI foi mantida como caminho separado por `npm run dev:cli` e `npm start`.
- O build web e gerado em `dist/web`; a CLI compilada fica em `dist/cli`.
- Nao ha dependencias de producao alem de React, React DOM e Lucide React.
