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
export const GET_BODY_WEIGHT_ENTRIES = gql`
  query GetBodyWeightEntries($userId: String!) {
    bodyWeightEntries(userId: $userId) {
      _id
      weight
      date
    }
  }
`;
//Thomas Kwon- Do not change (yet)
//Retrieves first name, last name, and weight based on Firebase UID
export const GET_USER_PROFILE = gql`
  query GetUserProfile($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
      name
      bodyWeight
    }
  }
`;
export const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
      name
      bodyWeight
    }
  }
`;
export const ADD_USER = gql`
  mutation AddUser($name: String!, $bodyWeight: Float!, $firebaseUid: String!) {
    addUser(name: $name, bodyWeight: $bodyWeight, firebaseUid: $firebaseUid) {
      _id
    }
  }
`;
export const GET_WORKOUTS = gql`
  query GetWorkouts($userId: String!) {
    workouts(userId: $userId) {
      _id
      name
      date
    }
  }
`;

export const GET_WORKOUT_ROUTINES = gql`
  query GetWorkoutRoutines($userId: String!) {
    getWorkoutRoutines(userId: $userId) {
      _id
      routineName
      days {
        name
        exercises {
          name
          sets
          muscles
        }
      }
    }
  }
`;
