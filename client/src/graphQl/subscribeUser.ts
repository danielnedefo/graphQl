import { gql } from "@apollo/client";

export const SUBSCRIBE_USER = gql`
  subscription  {
    newUser {
      name
      email
      phone
    }
  }
`;
