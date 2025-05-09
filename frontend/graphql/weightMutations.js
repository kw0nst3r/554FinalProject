import { gql } from "@apollo/client";

export const ADD_WEIGHT = gql`
  mutation AddBodyWeightEntry($userId: String!, $weight: Float!, $date: String!) {
    addBodyWeightEntry(userId: $userId, weight: $weight, date: $date) {
      _id
      weight
      date
    }
  }
`;

export const EDIT_WEIGHT = gql`
  mutation EditBodyWeightEntry($_id: String!, $weight: Float, $date: String) {
    editBodyWeightEntry(_id: $_id, weight: $weight, date: $date) {
      _id
      weight
      date
    }
  }
`;

export const REMOVE_WEIGHT = gql`
  mutation RemoveBodyWeightEntry($_id: String!) {
    removeBodyWeightEntry(_id: $_id) {
      _id
    }
  }
`;
