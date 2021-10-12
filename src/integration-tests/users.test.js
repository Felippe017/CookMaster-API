const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {expect} = chai
const { MongoClient } = require('mongodb');
const { getConnection } = require('./connectionMock');
const server = require('../api/app');


describe('POST /users', () => {

  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  /* CADASTRO DE USUÁRIO COM SUCESSO */
  describe('cadastro de usuários com sucesso ', () => {
    let response = {};

    before(async () => {
      response = await chai.request(server).post('/users').send({
        name: 'Rafael',
        email: 'rafael@trybe.com',
        password: '123456'
      });
    });


    it('retorna o código de status "201"', () => {
      expect(response).to.have.status(201);
    });

    it('o objeto possui a propriedade "user"', () => {
      expect(response.body).to.have.property('user');
  });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('a resposta possui a propriedade "id, name, email, role"', () => {
      expect(response.body.user).to.have.property("name");
      expect(response.body.user).to.have.property("email");
      expect(response.body.user).to.have.property("role");
      expect(response.body.user).to.have.property("_id");
    });     
  });


  /* EMAIL JÁ EXISTE NO BANCO */
  describe('o email já existe no banco de dados', () => {
    let response = {}

    before(async () => {

      const userCollection = connectionMock.db('Cookmaster').collection('user')
      await userCollection.insertOne({
        name: 'Rafael',
        email: 'rafael@trybe.com',
        password: '123456'
      })

      response = await chai.request(server).post('/users')
        .send({
          name: 'Rafael',
          email: 'rafael@trybe.com',
          password: '123456'
        });
     });

    it('retorna o código "409"', () => {
      expect(response).to.have.status(409);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('a propriedade "message" retorna "Email already registered"', () => {
      expect(response.body.message).to.be.equals('Email already registered');
    });
  });

  /* TESTE PARA CAMPOS INVÁLIDOS */
  describe('Quando não é passado os campos "nome", "email", "senha"', () => {
    let response = {}

    before(async () => {      

      response = await chai.request(server).post('/users')
        .send({
          name: '',
          email: '',
          password: ''
        });
     });

    it('retorna o código "400"', () => {
      expect(response).to.have.status(400);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('a propriedade "message" retorna "Invalid entries. Try again."', () => {
      expect(response.body.message).to.be.equals('Invalid entries. Try again.');
    });    
  });
});

describe('POST /users/admin', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('cadastro de usuário administrador com sucesso', () => {
    let response = {}

    before(async () => {

      const userCollection = connectionMock.db('Cookmaster').collection('users')
      await userCollection.insertOne({
        name: 'Rafael',
        email: 'rafael@trybe.com',
        password: 'password',
        role: 'admin'
      })

      const { body: { token } } = await chai.request(server).post('/login').send({
        email: 'rafael@trybe.com',
        password: 'password',
      });

      response = await chai.request(server).post('/users/admin')
      .set('authorization', token)
      .send({
          name: 'lotar',
          email: 'lotar@gmail.com',
          password: 'lotar-bah'
      });
    })

    it('retorna o código "201"', () => {
      expect(response).to.have.status(201);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "user"', () => {
      expect(response.body).to.have.property('user');
    });

    it('a propriedade "message" tem os campos "id, name, email, role"', () => {
      expect(response.body.user).to.includes.keys('_id', 'name', 'email', 'role');
    });
  });  

  describe('Não permite usuario qualquer criar usuários admin', () => {
    let response = {}

    before(async () => {

      const userCollection = connectionMock.db('Cookmaster').collection('users')
      await userCollection.insertOne({
        name: "tche",
        email: 'tche@bah.com',
        password: 'guri',
        role: ''
      })

      const { body: { token } } = await chai.request(server).post('/login').send({
        email: 'tche@bah.com',
        password: 'guri'
      });

      response = await chai.request(server).post(`/users/admin`)
      .set('authorization', token)
      .send({
        name: "Felippe",
        email: 'felippe@trybe.com',
        password: 'password-quero-pao',
        role: 'admin'
      });
      console.log(response)
    });

    it('retorna o código "403"', () => {
      expect(response).to.have.status(403);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('a propriedade "message" retorna "Only admins can register new admins"', () => {
      expect(response.body.message).to.be.equals('Only admins can register new admins')
    });
  })
}); 