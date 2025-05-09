import { gql } from '@apollo/client';

export const ADD_CALORIE_ENTRY = gql`
  mutation AddCalorieEntry(
    $userId: String!
    $food: String!
    $calories: Int!
    $protein: Float!
    $carbs: Float!
    $fats: Float!
    $date: String!
  ) {
    addCalorieEntry(
      userId: $userId
      food: $food
      calories: $calories
      protein: $protein
      carbs: $carbs
      fats: $fats
      date: $date
    ) {
      _id
      food
      calories
      protein
      carbs
      fats
      date
    }
  }
`;

export const EDIT_CALORIE_ENTRY = gql`
  mutation EditCalorieEntry(
    $_id: String!
    $food: String
    $calories: Int
    $protein: Float
    $carbs: Float
    $fats: Float
    $date: String
  ) {
    editCalorieEntry(
      _id: $_id
      food: $food
      calories: $calories
      protein: $protein
      carbs: $carbs
      fats: $fats
      date: $date
    ) {
      _id
      food
      calories
      protein
      carbs
      fats
      date
    }
  }
`;

export const REMOVE_CALORIE_ENTRY = gql`
  mutation RemoveCalorieEntry($_id: String!) {
    removeCalorieEntry(_id: $_id) {
      _id
    }
  }
`;