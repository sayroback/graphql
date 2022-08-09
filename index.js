import { ApolloServer, gql } from "apollo-server";
const persons = [
  {
    name: "Midu",
    phone: "224-876-5262",
    street: "123 Main St",
    city: "Anytown",
    id: "456456",
  },
  {
    name: "Youssef",
    phone: "754-876-9876",
    street: "5434 Main St",
    city: "Anytown",
    id: "7474646",
  },
  {
    name: "Itzi",
    street: "5435 Main St",
    city: "Anytown",
    id: "234678",
  },
];

//Definimos el tipo de datos que vamos a usar en nuestra aplicación
const typeDefs = `
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    address: String!
    id: ID!
  }
  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
`;
//Apollo ya resuelve las relaciones entre los datos que se van a usar no es necesario hacerlo manualmente, amenos que nosotros creemos un nuevo campo.

// Definimos el resolver (es el como resolverá la petición) de nuestra aplicación para los tipos de datos definidos anteriormente
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  // Aquí creamos un campo basado en un calculo hecho con los datos originales. Debemos agregarlo en typeDefs para que sea visible.
  Person: {
    address: (root) => `${root.street}, ${root.city}`,
  },
};
// Creamos el servidor de Apollo con los tipos de datos y el resolver
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
// Iniciamos el servidor en el puerto 4000
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
