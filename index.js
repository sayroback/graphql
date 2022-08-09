import { ApolloServer, gql, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";

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

/*
Definimos el tipo de datos que vamos a usar en nuestra aplicación
Apollo ya resuelve las relaciones entre los datos que se van a usar no es necesario hacerlo manualmente, amenos que nosotros creemos un nuevo campo.

type Address es un nuevo campo que reorganiza el objeto persons. En resolver declaramos como con los datos originales crear un nuevo objeto con los datos city y street.

Cambiar los datos en GraphQL se llama mutación, añadiremos una nueva persona a la lista addPerson.
  Primero definimos los datos de la persona que vamos a añadir.
*/
const typeDefs = `
  type Address{
    city: String!
    street: String!
  }
  type Person {
    name: String!
    phone: String
    id: ID!
    address: Address
  }
  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!): Person
  }
`;

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
  // Mutación para añadir una nueva persona a la lista
  Mutation: {
    addPerson: (root, args) => {
      // Validación en la mutación para que no se pueda añadir una persona con el mismo nombre
      if (persons.find((person) => person.name === args.name)) {
        throw new UserInputError("Person already exists", {
          invalidArgs: args.name,
        });
      }
      // ...args es una destructuración de los datos y asi ya no hace falta hacer person.name = args.name.
      const person = { ...args, id: uuid() };
      // En este caso solo añadimos a la persona con un push al arreglo.
      persons.push(person);
      return person;
    },
  },

  // Aquí creamos un campo basado en un calculo hecho con los datos originales. Debemos agregarlo en typeDefs para que sea visible.
  Person: {
    // Un objeto dentro de otro formado con los datos originales.
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
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
