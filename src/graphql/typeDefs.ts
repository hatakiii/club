export const typeDefs = `#graphql
  type Todo {
    id: Int
    title: String
    is_completed: Boolean
    created_at: String
  }
  type Query {
    getTodos: [Todo]
  }
  type Mutation {
    addTodo(title: String!): Todo
    updateTodo(id: Int!, title: String, is_completed: Boolean): Todo
    deleteTodo(id: Int!): Boolean
  }
`;
