import { gql } from "@apollo/client";

export const GET_CALORIE_ENTRIES = gql`
  query CalorieEntries($userId: String!) {
    calorieEntries(userId: $userId) {
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