import { gql } from '@apollo/client';

export const CREATE_CALORIE_ENTRY = gql`
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
    $food: String!
    $calories: Int!
    $protein: Float!
    $carbs: Float!
    $fats: Float!
    $date: String!
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
  mutation RemoveCalorieEntry(
    $_id: String!
  ) {
    removeCalorieEntry(
      _id: $_id
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

export const ADD_BODY_WEIGHT_ENTRY = gql`
  mutation AddBodyWeightEntry($userId: String!, $weight: Float!, $date: String!) {
    addBodyWeightEntry(userId: $userId, weight: $weight, date: $date) {
      _id
      weight
      date
    }
  }
`;

export const EDIT_BODY_WEIGHT_ENTRY = gql`
  mutation EditBodyWeightEntry($_id: String!, $weight: Float, $date: String) {
    editBodyWeightEntry(_id: $_id, weight: $weight, date: $date) {
      _id
      weight
      date
    }
  }
`;

export const REMOVE_BODY_WEIGHT_ENTRY = gql`
  mutation RemoveBodyWeightEntry($_id: String!) {
    removeBodyWeightEntry(_id: $_id) {
      _id
    }
  }
`;

export const ADD_WORKOUT_ROUTINE = gql`
  mutation AddWorkoutRoutine($userId: String!, $routineName: String!, $days: [WorkoutDayInput!]!) {
    addWorkoutRoutine(userId: $userId, routineName: $routineName, days: $days) {
      _id
      userId
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



// WORKING DO NOT CHANGE BELOW
export const UPDATE_USER_PROFILE = gql`
  mutation EditUser($id: String!, $name: String, $bodyWeight: Float, $photoUrl: String) {
    editUser(_id: $id, name: $name, bodyWeight: $bodyWeight, photoUrl: $photoUrl) {
      _id
      name
      bodyWeight
      photoUrl
    }
  }
`;
export const ADD_WORKOUT = gql`
  mutation AddWorkout($userId: String!, $name: String!, $date: String!) {
    addWorkout(userId: $userId, name: $name, date: $date) {
      _id
    }
  }
`;

export const ADD_EXERCISE = gql`
  mutation AddExercise($workoutId: String!, $name: String!, $sets: [SetInput!]!) {
    addExercise(workoutId: $workoutId, name: $name, sets: $sets) {
      _id
    }
  }
`;

//tom - updating /workout field inputs -- do not edit
export const UPDATE_WORKOUT_ROUTINE = gql`
  mutation UpdateWorkoutRoutine($id: ID!, $days: [WorkoutDayInput!]!) {
    updateWorkoutRoutine(id: $id, days: $days) {
      _id
      days {
        name
        exercises {
          name
          sets
          reps
          weight
          rir
          muscles
        }
      }
    }
  }
`;

