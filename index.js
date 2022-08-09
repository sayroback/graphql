import { ApolloServer, gql, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from "axios";
/*
Definimos el tipo de datos que vamos a usar en nuestra aplicación
Apollo ya resuelve las relaciones entre los datos que se van a usar no es necesario hacerlo manualmente, amenos que nosotros creemos un nuevo campo.

type Address es un nuevo campo que reorganiza el objeto persons. En resolver declaramos como con los datos originales crear un nuevo objeto con los datos city y street.

Cambiar los datos en GraphQL se llama mutación, añadiremos una nueva persona a la lista addPerson.
  Primero definimos los datos de la persona que vamos a añadir.
*/

const typeDefs = `
  enum YesNo {
    YES
    NO
  }
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
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!): Person
      editNumber(
        name: String!
        phone: String!
      ): Person
  }
`;

// Llamamos los datos desde una API externa
const { data: persons } = await axios.get("http://localhost:3000/persons");
// Definimos el resolver (es el como resolverá la petición) de nuestra aplicación para los tipos de datos definidos anteriormente
const resolvers = {
  Query: {
    personCount: () => persons.length,

    allPersons: async (root, args) => {
      if (!args.phone) return persons;
      const byPhone = (person) =>
        // Filtramos a las personas que tengan teléfono añadiéndoles el valor enum YesNo. YES si tiene teléfono, NO si no.
        args.phone === "YES" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    },
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
    editNumber: (root, args) => {
      // Editamos o agregamos el número de teléfono a la persona que se encuentra en la lista.
      const personIndex = persons.findIndex(
        (person) => person.name === args.name
      );
      if (personIndex === -1) return null;
      // Si no se encuentra la persona en la lista, retornamos un error.
      const person = persons[personIndex];
      // Actualizamos el número de teléfono de la persona.
      const updatedPerson = { ...person, phone: args.phone };
      // Actualizamos a la persona en la lista.
      persons[personIndex] = updatedPerson;
      // Retornamos la persona actualizada.
      return updatedPerson;
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
