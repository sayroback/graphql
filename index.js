import { gql } from "apollo-server";
const persons = [
  {
    name: "Midu",
    phone: "224-876-5262",
    street: "123 Main St",
    city: "Anytown",
    id: "456456",
  },
  {
    name: "Youseff",
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

const typeDefs = `
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }
  type Query {
    personCount: Int!
    allPersons: [Person]!
  }

`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
