# CookMaster API!
---

## Contexto

Este projeto trata-se de uma API no qual é possível fazer o cadastro e login de pessoas usuárias, onde apenas essas pessoas poderão acessar, modificar e deletar as receitas que cadastrou.

---

## Tecnologias Usadas

Back-End
> Desenvolvido usando: NodeJS, ExpressJS, MongoDB, ES6

---

## Instalando Dependências

* Para instalar as dependências do projeto:
```
npm install
```

---

## Executando aplicação

* Primeiro, conecte o mongoDB: 
  > sudo service mongod start

* Para se certificar de que o mongoDB está ativo:
  > sudo service mongod statu
 
* Para rodar a API:

```
npm start
```

ou

```
npm run dev
```
  
---

## Executando Testes

* Para rodar os testes, utilize o comando:
  > npm run dev:test

* Para visualizar a cobertura, utilize o comando:
  > npm run dev:test:coverage


⚠️ Quando rodar os testes, lembre-se de não estar rodando a API, pois o próprio teste já sobe a API para a porta 3000.


---
 
