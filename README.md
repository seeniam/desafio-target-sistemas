# Desafio Técnico — Target Sistemas

Aplicação de terminal em TypeScript/Node.js que resolve três exercícios: comissão de vendedores, movimentação de estoque e juros por atraso. Não há API, banco de dados ou frontend; os dados de estoque vivem apenas durante a execução.

## Tecnologias e requisitos

- Node.js 20 ou superior e npm
- TypeScript (modo `strict`), Node.js `readline` e Vitest

## Instalação e execução

```bash
npm install
npm run dev
```

Para gerar e executar a versão compilada:

```bash
npm run build
npm start
```

Para validar o projeto:

```bash
npm run typecheck
npm test
```

## Estrutura

```text
src/
  commissions/   regras de comissões
  inventory/     serviço de estoque e histórico
  interest/      cálculo de juros por dia civil
  data/          dados iniciais do enunciado
  utils/         conversão e apresentação monetária
  index.ts       CLI interativa
tests/           testes de domínio por exercício
```

## Soluções e regras de negócio

### 1. Comissão de vendedores

Cada venda é transformada em centavos, classificada e tem sua comissão arredondada ao centavo antes da soma por vendedor. Isso evita aplicar uma regra indevida sobre o total agregado e reduz problemas de ponto flutuante.

- Abaixo de R$100,00: 0%.
- **R$100,00 entra na faixa de 1%**; até R$499,99, permanece em 1%.
- **R$500,00 entra na faixa de 5%**.
- A comissão é calculada **por venda antes da agregação** por vendedor.

Ao escolher a opção `1`, a CLI mostra totais e o detalhamento de cada venda.

### 2. Estoque

A opção `2` lista os produtos e solicita código, tipo (`ENTRADA` ou `SAIDA`), quantidade e descrição. A CLI gera um identificador sequencial para cada lançamento. O serviço mantém identificadores únicos, histórico, estoque anterior e final.

O produto precisa existir; quantidade é inteira positiva; descrição não pode ser vazia; e o estoque **não permite saldo negativo**. Erros de entrada são apresentados sem encerrar a aplicação.

Exemplo: para o produto `101`, informe `ENTRADA`, quantidade `20` e uma descrição; em seguida será exibido o novo saldo.

### 3. Juros por atraso

A opção `3` recebe valor e vencimento no formato `AAAA-MM-DD`. O exercício foi interpretado como **juros simples de 2,5% ao dia**, pois o enunciado não especifica juros compostos:

```text
juros = valor × 0,025 × diasEmAtraso
valorAtualizado = valor + juros
```

Datas são strings de dia civil, validadas estritamente e convertidas internamente com `Date.UTC`. Não são usados horários no vencimento nem na referência; portanto, a diferença não sofre variação por hora/minuto/segundo ou timezone. A data atual mostrada pela CLI é o dia do calendário local. Vencimento hoje ou futuro produz zero dia de atraso e zero juros.

Exemplo: R$100,00 vencido há um dia resulta em R$2,50 de juros e R$102,50 atualizado.

## Decisões técnicas

- Valores monetários são armazenados em centavos inteiros, e formatados como BRL somente na saída.
- Regras de negócio não dependem de `readline`, permitindo testes unitários determinísticos.
- A função de juros aceita uma data de referência opcional; os testes nunca usam a data real do computador.
- Não há dependências de produção nem execução de comandos derivados de entradas do usuário.
