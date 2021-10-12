const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {expect} = chai
const { MongoClient } = require('mongodb');
const { getConnection, DBServer } = require('./connectionMock');
const server = require('../api/app');


describe('GET /recipes', () => {

  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
    await DBServer.stop();    
  });

  /* CRIA RECEITA SEM TOKEN */
  describe('Quando cria a receita sem token', () => {

    let response = {}

    before (async () => {
      response = await chai.request(server).post('/recipes')
      .set({'authorization': ''})
      .send({
        name: 'banana',
        ingredients: 'banana',
        preparation: 'banana'
      });
    });

    it('Deve retornar status 401', () => {
      expect(response).to.have.status(401);
    });

    it('o objeto retorna uma propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('a propriedade "message" retorna "missing auth token"', () => {
      expect(response.body.message).to.be.equals('missing auth token');
    });

  });

  // /* TOKEN INVÁLIDO */  
  // describe('Quando o token enviado é inválido', () => {

  //   let response = {}

  //   before(async () => {
  //     response = await chai.request(server).post('/recipes')
  //     .set('authorization', 'tokenInvalido')
  //     .send({
  //       name: 'banana',
  //       ingredients: 'banana',
  //       preparation: 'banana'
  //     });
  //   });

  //   it('retorna código de status 401', () => {
  //     expect(response).to.have.status(401);
  //   });

  //   it('retorna um objeto', () => {
  //     expect(response.body).to.be.a('object');
  //   });

  //   it('o objeto retorna uma propriedade "message"', () => {
  //     expect(response.body).to.have.property('message');
  //   });

  //   it('a propriedade "message" retorna "jwt malformed"', () => {
  //     expect(response.body.message).to.be.equals('jwt malformed');
  //   });
  // });

  describe('Quando não encontra nenhuma receita', () => {
    let response = {};

    before(async () => {

   /*    const userCollection = await connectionMock.db('Cookmaster').collection('users')
      await userCollection.insertOne({
        email: 'rafael@trybe.com',
        password: 'password'
      })
      const {body: {token}} = await chai.request(server).post('/login').send({
        email: 'rafael@trybe.com',
        password: 'password'
      })  */

  /*    const recipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
       await recipeCollection.insertOne({});  */

      response = await chai.request(server).get('/recipes')
      /* .send({});    */   

    });

     it('retorna o código de status "200"', () => {
       expect(response).to.have.status(200)
     });

    it('retorna um array', () => {
      expect(response.body).to.be.an('array');
    });

    it('o array é vazio', () => {
      expect(response.body).to.be.empty
    });
  });

  describe('Quando a receita é criada com sucesso', () => {
    let response;

    before(async () => {

      const { body: { token } } = await chai.request(server).post('/login').send({
        email: 'rafael@trybe.com',
        password: 'password'
      });

      response = await chai.request(server).post('/recipes')
      .set({'authorization': token})
      .send({
        name: 'banana',
        ingredients: 'banana',
        preparation: 'banana'
      });      
    });
    it('retorna código de status 201', () => {
      expect(response).to.have.status(201);
    });

    it('retorna um objeto no body', () => {
      expect(response.body).to.be.a('object');
    });

    it('objeto de resposta possui a propriedade "recipe"', () => {
      expect(response.body).to.have.property('recipe');
    });    

    it('a propriedade "message" tem os campos "id, name, ingredientes, preparation, userId"', () => {
      expect(response.body.recipe).to.includes.keys('_id', 'name', 'ingredients', 'preparation', 'userId');
    });
  });
});

describe('GET /recipes/:id', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
    await DBServer.stop();    
  });

  describe('Quando não encontra uma receita ', () => {
    before( async() => {
      const id = '999'
      response = await chai.request(server).get(`/recipes/${id}`)

    })

    it('retorna código de status 404', () => {
      expect(response).to.have.status(404);
    });

    it('retorna um objeto no body', () => {
      expect(response.body).to.have.a("object");
    });

    it('o objeto retorna uma propriedade "message" ', () => {
      expect(response.body).to.have.property('message');
    });

    it('a proprieda menssage tem o valor "recipe not found"', () => {
      expect(response.body.message).to.be.equal("recipe not found");
    });
  })

  describe('quando encontra uma receita', () => {
    let response = {}

    before(async () => {
      // const id = '615754f934d1988249b613ad';

      const userCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await userCollection.insertOne({
       name: 'nomeFake',
       ingredients: 'ingredientFake',
       preparation: 'preparationFake'
      });

      response = await chai.request(server).get(`/recipes/${id}`)    
    })

    it('retorna código de status 200', () => {
      expect(response).to.have.status(200);
    });

    it('retorna um objeto no body', () => {
      expect(response.body).to.have.a("object");
    });

    it('retorna uma propriedade chamada "_id", "name", "ingredients", "preparation"', () => {
      expect(response.body).to.have.a.property("_id");
      expect(response.body).to.have.a.property("name");
      expect(response.body).to.have.a.property("ingredients");
      expect(response.body).to.have.a.property("preparation");
    });
  })
})

describe('PUT /recipes/:id', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
    await DBServer.stop();    
  });

  describe('Erro ao passar um Token inválido', () => {
    let response;

    before(async () => {

      const userCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await userCollection.insertOne({
       name: 'nomeFake',
       ingredients: 'ingredientFake',
       preparation: 'preparationFake'
      });

      response = await chai.request(server).put(`/recipes/${id}`)
      .set({'authorization': 'lotar bah'})
      .send({
        name: 'editar',
        ingredients: 'string',
        preparation: 'string'
      });
    })

    it('retorna código de status 401', () => {
      expect(response).to.have.status(401);
    });

    it('retorna um objeto no body', () => {
      expect(response.body).to.have.a("object");
    });

    it('o objeto retorna uma propriedade "message" ', () => {
      expect(response.body).to.have.property('message');
    });

    it('a proprieda menssage tem o valor "jwt malformed"', () => {
      expect(response.body.message).to.be.equal("jwt malformed");
    });
  });

  describe('Erro ao não passar Token ', () => {
    let response;

    before(async () => {
      const userCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await userCollection.insertOne({
       name: 'nomeFake',
       ingredients: 'ingredientFake',
       preparation: 'preparationFake'
      });
      response = await chai.request(server).put(`/recipes/${id}`)
      .set({'authorization': '' })
      .send({
        name: 'nomeFake',
        ingredients: 'ingredientFake',
        preparation: 'preparationFake'
      });

    })
    it('retorna código de status 401', () => {
      expect(response).to.have.status(401);
    });

    it('retorna um objeto no body', () => {
      expect(response.body).to.have.a("object");
    });

    it('o objeto retorna uma propriedade "message" ', () => {
      expect(response.body).to.have.property('message');
    });

    it('a proprieda menssage tem o valor "missing auth token"', () => {
      expect(response.body.message).to.be.equal("missing auth token");
    });
  });

  describe('Ao atualizar uma receita', async () => {

    let response = {}

    const addRecipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await addRecipeCollection.insertOne({
       name: 'nomeFake',
       ingredients: 'ingredientFake',
       preparation: 'preparationFake'
      });

    const {body: { token } } = await chai.request(server).post('/login').send({
      email: 'lotar@tche.com',
      password: 'guriBahPiá'
    });

    response = await chai.request(server).put(`/recipes/${id}`)
      .set({'authorization': token })
      .send({
        name: 'bananada',
        ingredients: 'bananada',
        preparation: 'bananada'
      });

    it('retorna o código de status "200"', () => {
      expect(response).to.have.status(200);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.a('object');
    });

    it('a propriedade "message" tem os campos "id, name, ingredientes, preparation, userId"', () => {
      expect(response.body.recipe).to.includes.keys('_id', 'name', 'ingredients', 'preparation', 'userId');
    });   
  });
});

 describe('DELETE /recipes/:id', () => {
   /* let connectionMock;
   before(async () => {
     connectionMock = await getConnection();
     sinon.stub(MongoClient, 'connect').resolves(connectionMock);
   });
   after(async () => {
     MongoClient.connect.restore();
     await DBServer.stop();    
   });
   describe('quando deleta a receita', () => {
     let response = {}
  
     const addRecipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
       const { insertedId: id } = await addRecipeCollection.insertOne({
       name: 'nomeFake',
       ingredients: 'ingredientFake',
       preparation: 'preparationFake',
       // roubei a sua role
       //e pindurei na parede 
       });
  
     const {body: { token } } = await chai.request(server).post('/login').send({
     email:
     pass
     });
   }); */

    describe('quando não deleta a receita por passar token inválido', async () => {
      let response = {}

      const addRecipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await addRecipeCollection.insertOne({
        name: 'nomeFake',
        ingredients: 'ingredientFake',
        preparation: 'preparationFake'
      });

      // const { body: { token } } = await chai.request(server).post('/login').send({
      //   email: 'rafael@trybe.com',
      //   password: 'password'
      // });

      response = await chai.request(server).delete(`/recipes/${id}`).set({'authorization': '157-RJ' })

      it('retorna código de status 401', () => {
        expect(response).to.have.status(401);
      });

      it('retorna um objeto no body', () => {
        expect(response.body).to.have.a("object");
      });

      it('o objeto retorna uma propriedade "message" ', () => {
        expect(response.body).to.have.property('message');
      });

      it('a proprieda menssage tem o valor "jwt malformed"', () => {
        expect(response.body.message).to.be.equal("jwt malformed");
      });
    })

    describe('quando não deleta a receita por token vazio', async () => {
      let response = {}

      const addRecipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await addRecipeCollection.insertOne({
        name: 'nomeFake',
        ingredients: 'ingredientFake',
        preparation: 'preparationFake'
      });

      // const { body: { token } } = await chai.request(server).post('/login').send({
      //   email: 'rafael@trybe.com',
      //   password: 'password'
      // });

      response = await chai.request(server).delete(`/recipes/${id}`).set({'authorization': '' })

      it('retorna código de status 401', () => {
        expect(response).to.have.status(401);
      });

      it('retorna um objeto no body', () => {
        expect(response.body).to.have.a("object");
      });

      it('o objeto retorna uma propriedade "message" ', () => {
        expect(response.body).to.have.property('message');
      });

      it('a proprieda menssage tem o valor "missing auth token"', () => {
        expect(response.body.message).to.be.equal('missing auth token');
      });
    })

    describe('Será validado que é possivel excluir receita com usuário admin', async() => {
      let response = {}
      //cria receita
      const addRecipeCollection = await connectionMock.db('Cookmaster').collection('recipes')
      const { insertedId: id } = await addRecipeCollection.insertOne({
        name: 'nomeFake',
        ingredients: 'ingredientFake',
        preparation: 'preparationFake'
      });

      //cria um usuario admin
      const userCollection = await connectionMock.db('Cookmaster').collection('users')
      await userCollection.insertOne({
        email: 'rafael@trybe.com',
        password: 'password',
        role: 'admin'
      })
      //realiza o login e pega o Token
      const { body: { token } } = await chai.request(server).post('/login').send({
        email: 'rafael@trybe.com',
        password: 'password',
      });

      response = await chai.request(server).delete(`/recipes/${id}`).set({'authorization': token })

      it('Retorna o código de status "204"', () => {
        expect(response).to.have.status(204);
      });

      it('Body retorna uma propriedade chamada "id"', () => {
        expect(response.body).to.be.equal(id);
      });  
    })
})
