const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {expect} = chai
const { MongoClient } = require('mongodb');
const { getConnection } = require('./connectionMock');
const server = require('../api/app');


describe('POST /login', () => {

  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('Quando não possui os campos email e senha', () => {

    let response = {};

    before(async () => {
      response = await chai.request(server).post('/login').send({
        email: '',
        password: ''
      });
    });

    it('retorna o código de status 401', () => {
      expect(response).to.have.status(401);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('a propriedade "message" retorna "All fields must be filled"', () => {
      expect(response.body.message).to.be.equals('All fields must be filled');
    });   
  });

  describe('Quando usuário não existe  ou  senha incorreta', () => {

    let response = {};

    before(async () => {
      response = await chai.request(server).post('/login').send({
        email: 'fake@fake.com',
        password: 'senhaFake'
      });
    });

    it('retorna o código de status 401', () => {
      expect(response).to.have.status(401);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('a propriedade "message" retorna "Incorrect username or password"', () => {
      expect(response.body.message).to.be.equals('Incorrect username or password');
    }); 
  });

  describe('Login feito com sucesso', () => {
    let response = {}

    before(async () => {

      const userCollection = connectionMock.db('Cookmaster').collection('users')
      await userCollection.insertOne({
        email: 'rafael@trybe.com',
        password: 'password'
      })

      response = await chai.request(server).post('/login')
        .send({
          email: 'rafael@trybe.com',
          password: 'password'
        });
    });

    it('retorna o código "200"', () => {
      expect(response).to.have.status(200);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('o objeto retorna uma propriedade "token"', () => {
      expect(response.body).to.have.property('token');
    });

    it('a propriedade "token" não está vazia', () => {
      expect(response.body.token).to.be.not.empty;
    });
  });
}); 
