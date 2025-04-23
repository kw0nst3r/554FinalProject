export const typeDefs = `#graphql
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
    user: User!
    date: String!
    exercises: [Exercise!]!
  }

  type Exercise {
    _id: String!
    name: String!
    sets: [Set!]!
    workout: Workout!
  }

  type Set {
    weight: Float!
    reps: Int!
    rir: Int!
  }

  type CalorieEntry {
    _id: String!
    user: User!
    food: String!
    calories: Int!
    protein: Float!
    carbs: Float!
    fats: Float!
    date: String!
  }

  type BodyWeightEntry {
    _id: String!
    user: User!
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
  # Goals & Friends
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
    exercises: [ExerciseInput!]!
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

    workouts(userId: String!): [Workout]
    getWorkoutById(_id: String!): Workout
    exercises(workoutId: String!): [Exercise]

    calorieEntries(userId: String!): [CalorieEntry]
    bodyWeightEntries(userId: String!): [BodyWeightEntry]


    getProgressionSuggestions(userId: String!, workoutId: String!): [ProgressionSuggestion!]!
    getExerciseVariations(exerciseName: String!): ExerciseVariation!

    getWeightGraphData(userId: String!, startDate: String!, endDate: String!): [WeightGraphPoint!]!
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
    addUser(name: String!, bodyWeight: Float!): User

    logWorkout(userId: String!, name: String!): Workout
    addExercise(workoutId: String!, name: String!, sets: [SetInput!]!): Exercise

    logCalorieEntry(userId: String!, food: String!, calories: Int!, protein: Float!, carbs: Float!, fats: Float!): CalorieEntry
    logBodyWeightEntry(userId: String!, weight: Float!, date: String!): BodyWeightEntry

    setUserGoals( userId: String!, dailyCalorieTarget: Int, proteinTarget: Float, carbTarget: Float, fatTarget: Float, weightGoal: Float, goalType: String): UserGoals
    addFriend(userId: String!, friendId: String!): User
    removeFriend(userId: String!, friendId: String!): User

    createWorkoutTemplate(userId: String!, name: String!, exercises: [ExerciseInput!]!): WorkoutTemplate
    scheduleWorkout(userId: String!, date: String!, templateId: String!): Workout
  }
`;