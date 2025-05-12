//This file defines all GraphQL queries used across the app - this page is utilized by the pages

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

//Thomas Kwon- Do not change (yet)
//Retrieves first name, last name, and weight based on Firebase UID
export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: String!) {
    userProfile(userId: $userId) {
      firstName
      lastName
      weight
    }
  }
`;
