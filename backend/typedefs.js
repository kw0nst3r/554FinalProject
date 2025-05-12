import gql from 'graphql-tag';
export const typeDefs = gql`
 ####################
   # Core Types
   ####################
   type User {
     _id: String!
     name: String!
     bodyWeight: Float!
     workouts: [Workout!]!
     calorieEntries: [CalorieEntry!]!
     bodyWeightEntries: [BodyWeightEntry!]!
   }
 
   type Workout {
     _id: String!
     name: String!
     userId: User!
     date: String!
     exercises: [Exercise!]!
   }
 
   type Exercise {
     _id: String!
     name: String!
     sets: [Set!]!
     workout: Workout!
   }

   type TemplateExercise {
      name: String!
      sets: [Set!]!
    }
 
   type Set {
     weight: Float!
     reps: Int!
     rir: Int!
   }
 
   type CalorieEntry {
     _id: String!
     userId: User!
     food: String!
     calories: Int!
     protein: Float!
     carbs: Float!
     fats: Float!
     date: String!
   }
 
   type BodyWeightEntry {
     _id: String!
     userId: User!
     weight: Float!
     date: String!
   }
 
   ####################
   # Analytics Types
   ####################
   type ProgressionSuggestion {
     exerciseId: String!
     suggestedWeight: Float
     suggestedReps: Int
     rationale: String
   }
 
   type ExerciseVariation {
     originalExercise: Exercise!
     alternatives: [Exercise!]!
   }
 
   type BodyWeightGraphPoint {
     date: String!
     weight: Float!
   }
 
   type CalorieGraphPoint {
     date: String!
     calories: Int!
     protein: Float!
     carbs: Float!
     fats: Float!
   }
 
   type PersonalRecord {
     exerciseName: String!
     maxWeight: Float!
     maxReps: Int!
     dateAchieved: String!
   }
 
   ####################
   # Goals
   ####################
   type UserGoals {
     dailyCalorieTarget: Int
     proteinTarget: Float
     carbTarget: Float
     fatTarget: Float
     weightGoal: Float
     goalType: String
   }
 
   input UserGoalsInput {
     dailyCalorieTarget: Int
     proteinTarget: Float
     carbTarget: Float
     fatTarget: Float
     weightGoal: Float
     goalType: String
   }
 
   ####################
   # Templates
   ####################
   type WorkoutTemplate {
     _id: String!
     name: String!
     exercises: [TemplateExercise!]!
   }
 
   input ExerciseInput {
     name: String!
     sets: [SetInput!]!
   }
 
   input SetInput {
     weight: Float!
     reps: Int!
     rir: Int!
   }
 
   ####################
   # Queries
   ####################
   type Query {
     users: [User]
     getUserById(_id: String!): User
     getUserByFirebaseUid(firebaseUid: String!): User
     workouts(userId: String!): [Workout]
     getWorkoutById(_id: String!): Workout
     exercises(workoutId: String!): [Exercise]
 
     calorieEntries(userId: String!): [CalorieEntry]
     bodyWeightEntries(userId: String!): [BodyWeightEntry]
 
 
     getProgressionSuggestions(userId: String!, workoutId: String!): [ProgressionSuggestion!]!
     getExerciseVariations(exerciseName: String!): ExerciseVariation!
 
     getBodyWeightGraphData(userId: String!, startDate: String!, endDate: String!): [BodyWeightGraphPoint!]!
     getCalorieGraphData(userId: String!, startDate: String!, endDate: String!): [CalorieGraphPoint!]!
 
     getUserGoals(userId: String!): UserGoals
 
     getWorkoutTemplates(userId: String!): [WorkoutTemplate!]!
     getScheduledWorkouts(userId: String!, date: String!): [Workout!]!
 
     getPersonalRecords(userId: String!): [PersonalRecord!]!
   }
####################
# Mutations
####################
type Mutation {
addUser(name: String!, bodyWeight: Float!, firebaseUid: String!): User
  editUser(_id: String!, name: String, bodyWeight: Float): User
  removeUser(_id: String!): User

  addWorkout(userId: String!, name: String!, date: String!): Workout!
  editWorkout(_id: String!, name: String, date: String): Workout!
  removeWorkout(_id: String!): Workout!

  addExercise(workoutId: String!, name: String!, sets: [SetInput!]!): Exercise!
  editExercise(_id: String!, name: String, sets: [SetInput!]): Exercise!
  removeExercise(_id: String!): Exercise!

  addSet(exerciseId: String!, weight: Float!, reps: Int!, rir: Int!): Set
  editSet(exerciseId: String!, setIndex: Int!, weight: Float, reps: Int, rir: Int): Set
  removeSet(exerciseId: String!, setIndex: Int!): Set

  addCalorieEntry(
    userId: String!,
    food: String!,
    calories: Int!,
    protein: Float!,
    carbs: Float!,
    fats: Float!,
    date: String!
  ): CalorieEntry

  editCalorieEntry(
    _id: String!,
    food: String,
    calories: Int,
    protein: Float,
    carbs: Float,
    fats: Float,
    date: String
  ): CalorieEntry

  removeCalorieEntry(_id: String!): CalorieEntry

  addBodyWeightEntry(
    userId: String!,
    weight: Float!,
    date: String!
  ): BodyWeightEntry

  editBodyWeightEntry(
    _id: String!,
    weight: Float,
    date: String
  ): BodyWeightEntry

  removeBodyWeightEntry(_id: String!): BodyWeightEntry

  setUserGoals(
    userId: String!,
    dailyCalorieTarget: Int,
    proteinTarget: Float,
    carbTarget: Float,
    fatTarget: Float,
    weightGoal: Float,
    goalType: String
  ): UserGoals

  addWorkoutTemplate(
    userId: String!,
    name: String!,
    exercises: [ExerciseInput!]!
  ): WorkoutTemplate

  editWorkoutTemplate(
    _id: String!,
    name: String,
    exercises: [ExerciseInput!]
  ): WorkoutTemplate

  removeWorkoutTemplate(_id: String!): WorkoutTemplate

  addTemplateExercise(
    templateId: String!,
    exercise: ExerciseInput!
  ): WorkoutTemplate

  editTemplateExercise(
    templateId: String!,
    exerciseIndex: Int!,
    name: String,
    sets: [SetInput!]
  ): WorkoutTemplate

  removeTemplateExercise(
    templateId: String!,
    exerciseIndex: Int!
  ): TemplateExercise

  addTemplateSet(
    templateId: String!,
    exerciseIndex: Int!,
    set: SetInput!
  ): WorkoutTemplate

  editTemplateSet(
    templateId: String!,
    exerciseIndex: Int!,
    setIndex: Int!,
    weight: Float,
    reps: Int,
    rir: Int
  ): Set

  removeTemplateSet(
    templateId: String!,
    exerciseIndex: Int!,
    setIndex: Int!
  ): Set

  scheduleWorkout(
    userId: String!,
    date: String!,
    templateId: String!
  ): Workout
    addWorkoutRoutine(
    userId: String!,
    days: [WorkoutDayInput!]!
  ): WorkoutRoutine
}

####################
# New Routine Types
####################

input WorkoutDayInput {
  name: String!
  exercises: [RoutineExerciseInput!]!
}

input RoutineExerciseInput {
  name: String!
  sets: Int!
  muscles: [String!]!
}

type WorkoutRoutine {
  _id: ID!
  userId: String!
  days: [WorkoutDay!]!
}

type WorkoutDay {
  name: String!
  exercises: [RoutineExercise!]!
}

type RoutineExercise {
  name: String!
  sets: Int!
  muscles: [String!]!
}
`;
