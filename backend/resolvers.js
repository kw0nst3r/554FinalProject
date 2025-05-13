import {GraphQLError} from 'graphql';
import {users as usersCollectionFn, 
        workouts as workoutsCollectionFn, 
        exercises as exercisesCollectionFn,
        workoutTemplates as workoutTemplatesCollectionFn,
        calorieEntries as calorieEntriesCollectionFn,
        bodyWeightEntries as bodyWeightEntriesCollectionFn,
        userGoals as userGoalsCollectionFn,
        personalRecords as personalRecordsCollectionFn,
        workoutRoutines as workoutRoutinesCollectionFn} 
from "./MongoConfig/mongoCollections.js";
import {v4 as uuid} from "uuid";
import { ObjectId } from "mongodb"
import getRedisClient from "./redisClient.js"

export const resolvers = {
  Query: {
    users: async () => {
      const usersCollection = await usersCollectionFn();
      const users = await usersCollection.find({}).toArray();
      return users.map(u => ({ ...u, _id: u._id.toString() }));
    },
  
    getUserById: async (_, { _id }) => {
      const usersCollection = await usersCollectionFn();
      const user = await usersCollection.findOne({ _id: new ObjectId(_id) });
      if (!user) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      user._id = user._id.toString();
      return user;
    },
  
    workouts: async (_, { userId }) => {
      if (!userId || typeof userId !== "string" || !ObjectId.isValid(userId)) {
        throw new GraphQLError("Invalid userId provided.");
      }

      const workoutsCollection = await workoutsCollectionFn();
      
      const usersCollection = await usersCollectionFn();
      const user = await usersCollection.findOne({ firebaseUid: userId.trim() });
      if (!user) {
        throw new GraphQLError("User not found for provided Firebase UID.", { extensions: { code: "NOT_FOUND" } });
      }
      const workouts = await workoutsCollection.find({ userId: user._id }).toArray();
      return workouts.map(w => ({ ...w, _id: w._id.toString() }));
    },
  
    getWorkoutById: async (_, { _id }) => {
      const workoutsCollection = await workoutsCollectionFn();
      const workout = await workoutsCollection.findOne({ _id: new ObjectId(_id) });
      if (!workout) throw new GraphQLError("Workout not found", { extensions: { code: "NOT_FOUND" } });
      workout._id = workout._id.toString();
      return workout;
    },
  
    exercises: async (_, { workoutId }) => {
      const exercisesCollection = await exercisesCollectionFn();
      const exercises = await exercisesCollection.find({ workoutId: new ObjectId(workoutId) }).toArray();
      return exercises.map(e => ({ ...e, _id: e._id.toString() }));
    },
  
    calorieEntries: async (_, { userId }) => {
      const calorieCollection = await calorieEntriesCollectionFn();
      const entries = await calorieCollection.find({ userId: new ObjectId(userId) }).toArray();
      return entries.map(e => ({ ...e, _id: e._id.toString() }));
    },
  
    bodyWeightEntries: async (_, { userId }) => {
      const bodyWeightCollection = await bodyWeightEntriesCollectionFn();
      const entries = await bodyWeightCollection.find({ userId: new ObjectId(userId) }).toArray();
      return entries.map(e => ({ ...e, _id: e._id.toString() }));
    },
  
    getUserGoals: async (_, { userId }) => {
      const userGoalsCollection = await userGoalsCollectionFn();
      const goals = await userGoalsCollection.findOne({ userId: new ObjectId(userId) });
      if (!goals) return null;
      return goals;
    },
  
    getWorkoutTemplates: async () => {
      const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      const templates = await workoutTemplatesCollection.find({}).toArray();
      return templates.map(t => ({ ...t, _id: t._id.toString() }));
    },
  
    getScheduledWorkouts: async (_, { userId, date }) => {
      const workoutsCollection = await workoutsCollectionFn();
      const workouts = await workoutsCollection.find({ userId: new ObjectId(userId), date }).toArray();
      return workouts.map(w => ({ ...w, _id: w._id.toString() }));
    },

    getUserByFirebaseUid: async (_, { firebaseUid }) => {
      const usersCollection = await usersCollectionFn();
      const user = await usersCollection.findOne({ firebaseUid: firebaseUid.trim() });
      if (!user) throw new GraphQLError("User not found for provided Firebase UID.", { extensions: { code: "NOT_FOUND" } });
      user._id = user._id.toString();
      return user;
    }
  },

  CalorieEntry: {
        userId: async (parent) => {
            const usersCollection = await usersCollectionFn();
            const user = await usersCollection.findOne({ _id: parent.userId });
            if (!user) {
                throw new GraphQLError("User not found for calorie entry.", { extensions: { code: "NOT_FOUND" } });
            }
            user._id = user._id.toString();
            return user;
        }
    },
    BodyWeightEntry: {
      userId: async (parent) => {
          const usersCollection = await usersCollectionFn();
          const user = await usersCollection.findOne({ _id: parent.userId });
          if (!user) {
              throw new GraphQLError("User not found for calorie entry.", { extensions: { code: "NOT_FOUND" } });
          }
          user._id = user._id.toString();
          return user;
      }
    },
    Workout: {
          userId: async (parent) => {
              const usersCollection = await usersCollectionFn();
              const user = await usersCollection.findOne({ _id: parent.userId });
              if (!user) {
                  throw new GraphQLError("User not found for workout.", { extensions: { code: "NOT_FOUND" } });
              }
              user._id = user._id.toString();
              return user;
          },
          exercises: async (parent) => {
              const exercisesCollection = await exercisesCollectionFn();
              const exercises = await exercisesCollection.find({
                  workoutId: parent._id ? new ObjectId(parent._id) : null
              }).toArray();
              return exercises.map(e => ({ ...e, _id: e._id.toString() }));
          }
      },
      Exercise: {
        workout: async (parent) => {
            const workoutsCollection = await workoutsCollectionFn();
            const workout = await workoutsCollection.findOne({ _id: parent.workoutId });
            if (!workout) {
                throw new GraphQLError("Workout not found for exercise.", { extensions: { code: "NOT_FOUND" } });
            }
            workout._id = workout._id.toString();
            return workout;
        }
    },
    WorkoutTemplate: {
        exercises: (parent) => {
            return parent.exercises.map(ex => ({
                ...ex,
                sets: ex.sets
            }));
        }
    },
    TemplateExercise: {
        sets: (parent) => {
            return parent.sets;
        }
    },
    Mutation: {
        updateUserProfile: async (_, { userId, firstName, lastName, weight }) => {
            //Get the MongoDB users collection
            const usersCollection = await usersCollectionFn();

            //userID -> obojectID
            const _id = new ObjectId(userId);

            //first+last name
            const name = `${firstName.trim()} ${lastName.trim()}`;
            const updatedFields = {
              name,
              bodyWeight: weight
            };
            //update the user document and return the updated version
            const result = await usersCollection.findOneAndUpdate(
              { _id },
              { $set: updatedFields },
              { returnDocument: "after" }
            );

            //if no user found, return error
            if (!result.value) {
              throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
            }

            //return upd. user
            return {
              _id: result.value._id.toString(),
              name: result.value.name,
              bodyWeight: result.value.bodyWeight,
              workouts: [],
              calorieEntries: [],
              bodyWeightEntries: []
            };
          },

        addUser: async (_, {name, bodyWeight, firebaseUid}) => {
            const cache = await getRedisClient();
            // Validate Inputs
            // Name Validation - It should be a string
            if(!name.trim()){
                throw new GraphQLError(`Name cannot be empty or just spaces.`, {extensions: {code: 'BAD_USER_INPUT'}});
            } 
            name = name.trim();
            if(!bodyWeight){
                throw new GraphQLError(`Bodyweight cannot be empty.`, { extensions: {code: 'BAD_USER_INPUT'}});
            }
            if(bodyWeight < 0){
                throw new GraphQLError(`Bodyweight cannot be less than 0.`, { extensions: {code: 'BAD_USER_INPUT'}});
            }
            // now, we add to MongoDB
            const usersCollection = await usersCollectionFn();
            // next, create user object - FIXED 5/8/2025 

            let newUser = {
              name: name.trim(), 
              bodyWeight,
              firebaseUid: firebaseUid.trim()
            };

            let insert = await usersCollection.insertOne(newUser);
            if (!insert.acknowledged || !insert.insertedId) {
                throw new GraphQLError(`Could not Add User`, { extensions: { code: "INTERNAL_SERVER_ERROR" }});
            }
            // make sure id is a string when adding to redis
            newUser._id = insert.insertedId.toString();
            await cache.json.set(`users/${newUser._id}`, '$', newUser);
            await cache.json.del(`users`);
            return newUser;
        },
        editUser: async (_, {_id, name, bodyWeight}) => {
            const cache = await getRedisClient();
            // first step is to get the mongodb connection
            const usersCollection = await usersCollectionFn();
            // make sure _id exists
            if(!(typeof _id === 'string')){
              throw new GraphQLError(`_Id has to be a string.`, {extensions: {code: 'BAD_USER_INPUT'}});
            }
            if(!_id.trim()){
              throw new GraphQLError(`_Id cannot be empty or just spaces.`, {extensions: {code: 'BAD_USER_INPUT'}});
            }
            // then convert given _id, which is a string, to an ObjectId so we can query MongoDB. 
            _id = new ObjectId(_id);
            // now, query mongodb
            let editUser = await usersCollection.findOne({_id});
            if(!editUser){
                throw new GraphQLError(`User object cannot be found.`, {extensions: {code: 'NOT_FOUND'}});
            }
            // now, find which fields were updated
            let updatedFields = {};
            // since all inputs are not required, we have to check if they are provided before making any changes
            if(name !== undefined){
                if(!(typeof name === 'string')){
                  throw new GraphQLError(`Name has to be a string.`, {extensions: {code: 'BAD_USER_INPUT'}});
                }
                if(!name.trim()){
                    throw new GraphQLError(`Name term cannot be empty or just spaces.`, {extensions: {code: 'BAD_USER_INPUT'}});
                } 
                updatedFields.name = name.trim();
            }
            if(bodyWeight !== undefined){
                if(!(typeof bodyWeight === 'number')){
                    throw new GraphQLError(`Bodyweight has to be a string.`, {extensions: {code: 'BAD_USER_INPUT'}});
                }
                if(!bodyWeight){
                    throw new GraphQLError(`Bodyweight cannot be empty.`, { extensions: {code: 'BAD_USER_INPUT'}});
                }
                if(bodyWeight < 0){
                    throw new GraphQLError(`Bodyweight cannot be less than 0.`, { extensions: {code: 'BAD_USER_INPUT'}});
                }
                updatedFields.bodyWeight = bodyWeight;
            }
            // now, check to make sure updatedFields isn't empty
            if(Object.keys(updatedFields).length === 0){
                throw new GraphQLError(`At least one field must be updated.`, { extensions: {code: 'BAD_USER_INPUT'}});
            }
            let updateResult = await usersCollection.findOneAndUpdate({ _id }, { $set: updatedFields });
            let updatedUser = await usersCollection.findOne({ _id });
            await cache.json.set(`users/${_id.toString()}`, "$", updatedUser);
            await cache.json.del(`users`);
            return updatedUser;
        },
        removeUser: async (_, {_id}) => {
            const cache = await getRedisClient();
            // get mongodb collections
            const usersCollection = await usersCollectionFn();
            const workoutsCollection = await workoutsCollectionFn();
            const calorieEntriesCollection = await calorieEntriesCollectionFn();
            const bodyWeightEntriesCollection = await bodyWeightEntriesCollectionFn();

            // validate _id
            if (!(typeof _id === 'string')) {
              throw new GraphQLError(`_Id has to be a string.`, { extensions: { code: 'BAD_USER_INPUT' } });
            }
            if (!_id.trim()) {
              throw new GraphQLError(`_Id cannot be empty or just spaces.`, { extensions: { code: 'BAD_USER_INPUT' } });
            }

            const userObjectId = new ObjectId(_id);

            // Check if user exists
            const user = await usersCollection.findOne({ _id: userObjectId });
            if (!user) {
              throw new GraphQLError(`User not found.`, { extensions: { code: 'NOT_FOUND' } });
            }
            // Delete the user
            const deleteUserResult = await usersCollection.deleteOne({ _id: userObjectId });
            if (deleteUserResult.deletedCount === 0) {
              throw new GraphQLError(`Failed to delete user.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
            }
            // Clean up related data
            await workoutsCollection.deleteMany({ userId: userObjectId });
            await calorieEntriesCollection.deleteMany({ userId: userObjectId });
            await bodyWeightEntriesCollection.deleteMany({ userId: userObjectId });

            // Redis clean up
            await cache.json.del(`users/${_id}`);
            await cache.json.del(`users`);
            await cache.json.del(`workouts/user/${_id}`);
            await cache.json.del(`calories/user/${_id}`);
            await cache.json.del(`weights/user/${_id}`);

            return user;
        },
        addCalorieEntry: async (_, { userId, food, calories, protein, carbs, fats, date }) => {
            const cache = await getRedisClient();
            // Validation
            if(!userId?.trim()){
                throw new GraphQLError("UserId cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (!food?.trim()) {
              throw new GraphQLError("Food name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
              throw new GraphQLError("Macros and calories must be greater than 0.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (!date || isNaN(new Date(date))) {
              throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            const calorieCollection = await calorieEntriesCollectionFn();
            const newEntry = {
              userId: new ObjectId(userId),
              food: food.trim(),
              calories,
              protein,
              carbs,
              fats,
              date
            };
            const insert = await calorieCollection.insertOne(newEntry);
            if (!insert.acknowledged) {
              throw new GraphQLError("Failed to add calorie entry.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
            newEntry._id = insert.insertedId.toString();
            await cache.json.set(`calories/${newEntry._id}`, "$", newEntry);
            await cache.json.del(`calories/user/${userId}`);
            return newEntry;
          },
          editCalorieEntry: async (_, { _id, food, calories, protein, carbs, fats, date }) => {
            const cache = await getRedisClient();
            const calorieCollection = await calorieEntriesCollectionFn();
            const objId = new ObjectId(_id);
            const editEntry = await calorieCollection.findOne({ _id: objId });
            if (!editEntry) {
              throw new GraphQLError("Calorie entry not found.", { extensions: { code: "NOT_FOUND" } });
            }
            const updates = {};
            if (food !== undefined) {
              if (!food.trim()) throw new GraphQLError("Food cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
              updates.food = food.trim();
            }
            if ([calories, protein, carbs, fats].some(x => x !== undefined && x < 0)) {
              throw new GraphQLError("Macros and calories must be greater than 0.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (calories !== undefined) updates.calories = calories;
            if (protein !== undefined) updates.protein = protein;
            if (carbs !== undefined) updates.carbs = carbs;
            if (fats !== undefined) updates.fats = fats;
            if (date !== undefined) {
              if (!date || isNaN(new Date(date))) {
                throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates.date = date;
            }
            if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            await calorieCollection.updateOne({ _id: objId }, { $set: updates });
            const updated = await calorieCollection.findOne({ _id: objId });
            await cache.json.set(`calories/${_id}`, "$", updated);
            await cache.json.del(`calories/user/${editEntry.userId.toString()}`);
            return updated;
          },
          removeCalorieEntry: async (_, { _id }) => {
            const cache = await getRedisClient();
            const calorieCollection = await calorieEntriesCollectionFn();
          
            // Validate _id
            if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            const objId = new ObjectId(_id);
          
            // Check if the calorie entry exists
            const entry = await calorieCollection.findOne({ _id: objId });
            if (!entry) {
              throw new GraphQLError("Calorie entry not found.", { extensions: { code: "NOT_FOUND" } });
            }
          
            // Delete from MongoDB
            const deleteResult = await calorieCollection.deleteOne({ _id: objId });
            if (deleteResult.deletedCount === 0) {
              throw new GraphQLError("Failed to delete calorie entry.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
          
            // Clean up Redis
            await cache.json.del(`calories/${_id}`);
            await cache.json.del(`calories/user/${entry.userId.toString()}`);
          
            return entry;
          },
          addBodyWeightEntry: async (_, { userId, weight, date }) => {
            const cache = await getRedisClient();
            if(!userId?.trim()){
                throw new GraphQLError("UserId cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (weight <= 0) {
              throw new GraphQLError("Weight must be greater than 0.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (!date || isNaN(new Date(date))) {
              throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            const bodyWeightCollection = await bodyWeightEntriesCollectionFn();
            const entry = {
              userId: new ObjectId(userId),
              weight,
              date
            };
            const insert = await bodyWeightCollection.insertOne(entry);
            if (!insert.acknowledged) {
              throw new GraphQLError("Failed to add body weight entry.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
            entry._id = insert.insertedId.toString();
            await cache.json.set(`weights/${entry._id}`, "$", entry);
            await cache.json.del(`weights/user/${userId}`);
            return entry;
          },
          editBodyWeightEntry: async (_, { _id, weight, date }) => {
            const cache = await getRedisClient();
            const bodyWeightCollection = await bodyWeightEntriesCollectionFn();
            const objId = new ObjectId(_id);
            const original = await bodyWeightCollection.findOne({ _id: objId });
            if (!original) {
              throw new GraphQLError("Body weight entry not found.", { extensions: { code: "NOT_FOUND" } });
            }
            const updates = {};
            if (weight !== undefined) {
              if (weight <= 0) {
                throw new GraphQLError("Weight must be greater than 0.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates.weight = weight;
            }
            if (date !== undefined) {
              if (!date || isNaN(new Date(date))) {
                throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates.date = date;
            }
            if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            await bodyWeightCollection.updateOne({ _id: objId }, { $set: updates });
            const updated = await bodyWeightCollection.findOne({ _id: objId });
            await cache.json.set(`weights/${_id}`, "$", updated);
            await cache.json.del(`weights/user/${original.userId.toString()}`);
            return updated;
          },
          removeBodyWeightEntry: async (_, { _id }) => {
            const cache = await getRedisClient();
            const bodyWeightCollection = await bodyWeightEntriesCollectionFn();
          
            // Validate _id
            if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            const objId = new ObjectId(_id);
          
            // Check if the body weight entry exists
            const entry = await bodyWeightCollection.findOne({ _id: objId });
            if (!entry) {
              throw new GraphQLError("Body weight entry not found.", { extensions: { code: "NOT_FOUND" } });
            }
          
            // Delete from MongoDB
            const deleteResult = await bodyWeightCollection.deleteOne({ _id: objId });
            if (deleteResult.deletedCount === 0) {
              throw new GraphQLError("Failed to delete body weight entry.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
          
            // Clean up Redis
            await cache.json.del(`weights/${_id}`);
            await cache.json.del(`weights/user/${entry.userId.toString()}`);
          
            return entry;
          },
          addExercise: async (_, { workoutId, name, sets }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
            const workoutsCollection = await workoutsCollectionFn();
            // Validate workoutId
            if (!(typeof workoutId === 'string') || !workoutId.trim()) {
              throw new GraphQLError("workoutId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            // Validate name
            if (!(typeof name === 'string') || !name.trim()) {
              throw new GraphQLError("Exercise name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            // Validate sets array
            if (!Array.isArray(sets) || sets.length === 0) {
              throw new GraphQLError("Sets must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            for (const set of sets) {
              if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
              }
            }
            const workoutObjId = new ObjectId(workoutId);
            // Check if workout exists
            const workout = await workoutsCollection.findOne({ _id: workoutObjId });
            if (!workout) {
              throw new GraphQLError("Workout not found.", { extensions: { code: "NOT_FOUND" } });
            }
            // Build the new exercise object
            const newExercise = {
              name: name.trim(),
              sets,
              workoutId: workoutObjId
            };
            const insert = await exercisesCollection.insertOne(newExercise);
            if (!insert.acknowledged) {
              throw new GraphQLError("Failed to add exercise.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
            newExercise._id = insert.insertedId.toString();
            await cache.json.del(`exercises/workout/${workoutId}`);
            return newExercise;
          },
          editExercise: async (_, { _id, name, sets }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
          
            // Validate _id
            if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            const exerciseObjId = new ObjectId(_id);
          
            // Check if exercise exists
            const exercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            if (!exercise) {
              throw new GraphQLError("Exercise not found.", { extensions: { code: "NOT_FOUND" } });
            }
          
            const updates = {};
            if (name !== undefined) {
              if (!(typeof name === 'string') || !name.trim()) {
                throw new GraphQLError("Name must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates.name = name.trim();
            }
          
            if (sets !== undefined) {
              if (!Array.isArray(sets) || sets.length === 0) {
                throw new GraphQLError("Sets must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              for (const set of sets) {
                if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                  throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
                }
              }
              updates.sets = sets;
            }
          
            if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            await exercisesCollection.updateOne(
              { _id: exerciseObjId },
              { $set: updates }
            );
          
            const updatedExercise = await exercisesCollection.findOne({ _id: exerciseObjId });
          
            await cache.json.set(`exercises/${_id}`, "$", updatedExercise);
            await cache.json.del(`exercises/workout/${exercise.workoutId.toString()}`);
            return updatedExercise;
          },
          removeExercise: async (_, { _id }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
          
            // Validate _id
            if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            const exerciseObjId = new ObjectId(_id);
          
            // Check if exercise exists
            const exercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            if (!exercise) {
              throw new GraphQLError("Exercise not found.", { extensions: { code: "NOT_FOUND" } });
            }
          
            // Delete from MongoDB
            const deleteResult = await exercisesCollection.deleteOne({ _id: exerciseObjId });
            if (deleteResult.deletedCount === 0) {
              throw new GraphQLError("Failed to delete exercise.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
            }
          
            // Clean up Redis
            await cache.json.del(`exercises/${_id}`);
            await cache.json.del(`exercises/workout/${exercise.workoutId.toString()}`);
          
            return exercise;
          },
          addSet: async (_, { exerciseId, weight, reps, rir }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
            // Validate exerciseId
            if (!(typeof exerciseId === 'string') || !exerciseId.trim()) {
              throw new GraphQLError("exerciseId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            // Validate set inputs
            if (weight <= 0 || reps <= 0 || rir < 0) {
              throw new GraphQLError("Weight, reps must be > 0 and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            const exerciseObjId = new ObjectId(exerciseId);
            // Check if the exercise exists
            const exercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            if (!exercise) {
              throw new GraphQLError("Exercise not found.", { extensions: { code: "NOT_FOUND" } });
            }
            const newSet = { weight, reps, rir };
            // Push the new set
            await exercisesCollection.updateOne(
              { _id: exerciseObjId },
              { $push: { sets: newSet } }
            );
            const updatedExercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            await cache.json.set(`exercises/${exerciseId}`, "$", updatedExercise);
            await cache.json.del(`exercises/workout/${exercise.workoutId.toString()}`);
            return newSet;
          },
          editSet: async (_, { exerciseId, setIndex, weight, reps, rir }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
          
            // Validate exerciseId
            if (!(typeof exerciseId === 'string') || !exerciseId.trim()) {
              throw new GraphQLError("exerciseId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            const exerciseObjId = new ObjectId(exerciseId);
          
            // Check if exercise exists
            const exercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            if (!exercise) {
              throw new GraphQLError("Exercise not found.", { extensions: { code: "NOT_FOUND" } });
            }
          
            // Validate setIndex
            if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= exercise.sets.length) {
              throw new GraphQLError("Invalid setIndex.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            // Build the update path for the set
            const updateFields = {};
            if (weight !== undefined) {
              if (weight <= 0) throw new GraphQLError("Weight must be > 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updateFields[`sets.${setIndex}.weight`] = weight;
            }
            if (reps !== undefined) {
              if (reps <= 0) throw new GraphQLError("Reps must be > 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updateFields[`sets.${setIndex}.reps`] = reps;
            }
            if (rir !== undefined) {
              if (rir < 0) throw new GraphQLError("RIR must be >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updateFields[`sets.${setIndex}.rir`] = rir;
            }
          
            if (Object.keys(updateFields).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
            }
          
            // Update the specific set
            await exercisesCollection.updateOne(
              { _id: exerciseObjId },
              { $set: updateFields }
            );
          
            const updatedExercise = await exercisesCollection.findOne({ _id: exerciseObjId });
          
            await cache.json.set(`exercises/${exerciseId}`, "$", updatedExercise);
            await cache.json.del(`exercises/workout/${exercise.workoutId.toString()}`);
          
            return updatedExercise.sets[setIndex];
          },
          removeSet: async (_, { exerciseId, setIndex }) => {
            const cache = await getRedisClient();
            const exercisesCollection = await exercisesCollectionFn();
            // Validate exerciseId
            if (!(typeof exerciseId === 'string') || !exerciseId.trim()) {
              throw new GraphQLError("exerciseId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            const exerciseObjId = new ObjectId(exerciseId);
            // Check if exercise exists
            const exercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            if (!exercise) {
              throw new GraphQLError("Exercise not found.", { extensions: { code: "NOT_FOUND" } });
            }
            // Validate setIndex
            if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= exercise.sets.length) {
              throw new GraphQLError("Invalid setIndex.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            // Optionally store the set we're about to remove (to return it)
            const removedSet = exercise.sets[setIndex];
            // Use $unset to null out the element, then $pull to remove nulls
            await exercisesCollection.updateOne(
              { _id: exerciseObjId },
              { $unset: { [`sets.${setIndex}`]: 1 } }
            );
            await exercisesCollection.updateOne(
              { _id: exerciseObjId },
              { $pull: { sets: null } }
            );
            const updatedExercise = await exercisesCollection.findOne({ _id: exerciseObjId });
            await cache.json.set(`exercises/${exerciseId}`, "$", updatedExercise);
            await cache.json.del(`exercises/workout/${exercise.workoutId.toString()}`);
            return removedSet;
          },
          addWorkout: async (_, { userId, name, date }) => {
              const cache = await getRedisClient();
              const workoutsCollection = await workoutsCollectionFn();
              const usersCollection = await usersCollectionFn();
            
              // Validate userId
              if (!(typeof userId === 'string') || !userId.trim()) {
                  throw new GraphQLError("userId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              // Validate name
              if (!(typeof name === 'string') || !name.trim()) {
                  throw new GraphQLError("Workout name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              // Validate date
              if (!date || isNaN(new Date(date))) {
                  throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              const userObjId = new ObjectId(userId);
              // Check if user exists
              const user = await usersCollection.findOne({ _id: userObjId });
              if (!user) {
                  throw new GraphQLError("User not found.", { extensions: { code: "NOT_FOUND" } });
              }
              const newWorkout = {
                  name: name.trim(),
                  userId: userObjId,
                  date,
                  exercises: []
              };
              const insert = await workoutsCollection.insertOne(newWorkout);
              if (!insert.acknowledged) {
                  throw new GraphQLError("Failed to add workout.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
              }
              newWorkout._id = insert.insertedId.toString();
              await cache.json.set(`workouts/${newWorkout._id}`, "$", newWorkout);
              await cache.json.del(`workouts/user/${userId}`);
              return newWorkout;
          },
          addWorkoutRoutine: async (_, { userId, routineName, days }) => {
            const routine = {
              userId,
              routineName,
              days
            };
          
            const workoutRoutinesCollection = await workoutRoutinesCollectionFn();
            const result = await workoutRoutinesCollection.insertOne(routine);
            return {
              _id: result.insertedId,
              userId,
              routineName,
              days
            };
          },

        editWorkout: async (_, { _id, name, date }) => {
            const cache = await getRedisClient();
            const workoutsCollection = await workoutsCollectionFn();
            // Validate _id
            if (!(typeof _id === 'string') || !_id.trim()) {
                throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            const workoutObjId = new ObjectId(_id);
            // Check if workout exists
            const workout = await workoutsCollection.findOne({ _id: workoutObjId });
            if (!workout) {
                throw new GraphQLError("Workout not found.", { extensions: { code: "NOT_FOUND" } });
            }
            const updates = {};
            if (name !== undefined) {
                if (!(typeof name === 'string') || !name.trim()) {
                    throw new GraphQLError("Workout name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
                }
                updates.name = name.trim();
            }
            if (date !== undefined) {
                if (!date || isNaN(new Date(date))) {
                    throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
                }
                updates.date = date;
            }
            if (Object.keys(updates).length === 0) {
                throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
            }
            await workoutsCollection.updateOne({ _id: workoutObjId }, { $set: updates });
            const updatedWorkout = await workoutsCollection.findOne({ _id: workoutObjId });
            await cache.json.set(`workouts/${_id}`, "$", updatedWorkout);
            await cache.json.del(`workouts/user/${updatedWorkout.userId.toString()}`);
            return updatedWorkout;
        },
      removeWorkout: async (_, { _id }) => {
          const cache = await getRedisClient();
          const workoutsCollection = await workoutsCollectionFn();
          const exercisesCollection = await exercisesCollectionFn();
          // Validate _id
          if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const workoutObjId = new ObjectId(_id);
          // Check if workout exists
          const workout = await workoutsCollection.findOne({ _id: workoutObjId });
          if (!workout) {
              throw new GraphQLError("Workout not found.", { extensions: { code: "NOT_FOUND" } });
          }
          // Delete the workout
          const deleteResult = await workoutsCollection.deleteOne({ _id: workoutObjId });
          if (deleteResult.deletedCount === 0) {
              throw new GraphQLError("Failed to delete workout.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
          // Clean up related exercises
          await exercisesCollection.deleteMany({ workoutId: workoutObjId });
          // Clean up Redis
          await cache.json.del(`workouts/${_id}`);
          await cache.json.del(`workouts/user/${workout.userId.toString()}`);
          await cache.json.del(`exercises/workout/${_id}`);
          return workout;
      },
      addWorkoutTemplate: async (_, { name, exercises }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          // Validate name
          if (!(typeof name === 'string') || !name.trim()) {
              throw new GraphQLError("Template name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          // Validate exercises
          if (!Array.isArray(exercises) || exercises.length === 0) {
              throw new GraphQLError("Exercises must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          for (const ex of exercises) {
              if (!(typeof ex.name === 'string') || !ex.name.trim()) {
                  throw new GraphQLError("Each exercise must have a valid name.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
                  throw new GraphQLError("Each exercise must have a non-empty sets array.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              for (const set of ex.sets) {
                  if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                      throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
                  }
              }
          }
      
          const newTemplate = {
              name: name.trim(),
              exercises: exercises.map(ex => ({
                  name: ex.name.trim(),
                  sets: ex.sets
              }))
          };
      
          const insert = await workoutTemplatesCollection.insertOne(newTemplate);
          if (!insert.acknowledged) {
              throw new GraphQLError("Failed to add workout template.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
          newTemplate._id = insert.insertedId.toString();
      
          await cache.json.del(`workoutTemplates`);
          return newTemplate;
      },
      editWorkoutTemplate: async (_, { _id, name, exercises }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(_id);
      
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          const updates = {};
          if (name !== undefined) {
              if (!(typeof name === 'string') || !name.trim()) {
                  throw new GraphQLError("Template name must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates.name = name.trim();
          }
          if (exercises !== undefined) {
              if (!Array.isArray(exercises) || exercises.length === 0) {
                  throw new GraphQLError("Exercises must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              for (const ex of exercises) {
                  if (!(typeof ex.name === 'string') || !ex.name.trim()) {
                      throw new GraphQLError("Each exercise must have a valid name.", { extensions: { code: "BAD_USER_INPUT" } });
                  }
                  if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
                      throw new GraphQLError("Each exercise must have a non-empty sets array.", { extensions: { code: "BAD_USER_INPUT" } });
                  }
                  for (const set of ex.sets) {
                      if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                          throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
                      }
                  }
              }
              updates.exercises = exercises.map(ex => ({
                  name: ex.name.trim(),
                  sets: ex.sets
              }));
          }
      
          if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $set: updates }
          );
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return { ...updatedTemplate, _id: updatedTemplate._id.toString() };
      },
      removeWorkoutTemplate: async (_, { _id }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof _id === 'string') || !_id.trim()) {
              throw new GraphQLError("_id must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(_id);
      
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
      
          const deleteResult = await workoutTemplatesCollection.deleteOne({ _id: templateObjId });
          if (deleteResult.deletedCount === 0) {
              throw new GraphQLError("Failed to delete workout template.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
      
          await cache.json.del(`workoutTemplates`);
          return { ...template, _id: template._id.toString() };
      },
      addTemplateExercise: async (_, { templateId, exercise }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          if (!(typeof exercise.name === 'string') || !exercise.name.trim()) {
              throw new GraphQLError("Exercise name cannot be empty.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
              throw new GraphQLError("Sets must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          for (const set of exercise.sets) {
              if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                  throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
              }
          }
      
          const templateObjId = new ObjectId(templateId);
      
          const updateResult = await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $push: { exercises: { name: exercise.name.trim(), sets: exercise.sets } } }
          );
      
          if (updateResult.modifiedCount === 0) {
              throw new GraphQLError("Failed to add exercise.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return { ...updatedTemplate, _id: updatedTemplate._id.toString() };
      },
      editTemplateExercise: async (_, { templateId, exerciseIndex, name, sets }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= template.exercises.length) {
              throw new GraphQLError("Invalid exerciseIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          const updates = {};
          if (name !== undefined) {
              if (!(typeof name === 'string') || !name.trim()) {
                  throw new GraphQLError("Exercise name must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              updates[`exercises.${exerciseIndex}.name`] = name.trim();
          }
          if (sets !== undefined) {
              if (!Array.isArray(sets) || sets.length === 0) {
                  throw new GraphQLError("Sets must be a non-empty array.", { extensions: { code: "BAD_USER_INPUT" } });
              }
              for (const set of sets) {
                  if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
                      throw new GraphQLError("Each set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
                  }
              }
              updates[`exercises.${exerciseIndex}.sets`] = sets;
          }
      
          if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $set: updates }
          );
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return { ...updatedTemplate, _id: updatedTemplate._id.toString() };
      },
        removeTemplateExercise: async (_, { templateId, exerciseIndex }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= template.exercises.length) {
              throw new GraphQLError("Invalid exerciseIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          // Optionally return the removed exercise
          const removedExercise = template.exercises[exerciseIndex];
      
          // $unset + $pull to remove the null slot
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $unset: { [`exercises.${exerciseIndex}`]: 1 } }
          );
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $pull: { exercises: null } }
          );
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return removedExercise;
      },
      addTemplateSet: async (_, { templateId, exerciseIndex, set }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= template.exercises.length) {
              throw new GraphQLError("Invalid exerciseIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
              throw new GraphQLError("Set must have weight > 0, reps > 0, and RIR >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          const updateResult = await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $push: { [`exercises.${exerciseIndex}.sets`]: set } }
          );
      
          if (updateResult.modifiedCount === 0) {
              throw new GraphQLError("Failed to add set.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return { ...updatedTemplate, _id: updatedTemplate._id.toString() };
      },
      editTemplateSet: async (_, { templateId, exerciseIndex, setIndex, weight, reps, rir }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= template.exercises.length) {
              throw new GraphQLError("Invalid exerciseIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const exercise = template.exercises[exerciseIndex];
          if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= exercise.sets.length) {
              throw new GraphQLError("Invalid setIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
        
          const updates = {};
          if (weight !== undefined) {
              if (weight <= 0) throw new GraphQLError("Weight must be > 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updates[`exercises.${exerciseIndex}.sets.${setIndex}.weight`] = weight;
          }
          if (reps !== undefined) {
              if (reps <= 0) throw new GraphQLError("Reps must be > 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updates[`exercises.${exerciseIndex}.sets.${setIndex}.reps`] = reps;
          }
          if (rir !== undefined) {
              if (rir < 0) throw new GraphQLError("RIR must be >= 0.", { extensions: { code: "BAD_USER_INPUT" } });
              updates[`exercises.${exerciseIndex}.sets.${setIndex}.rir`] = rir;
          }
      
          if (Object.keys(updates).length === 0) {
              throw new GraphQLError("At least one field must be updated.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $set: updates }
          );
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return updatedTemplate.exercises[exerciseIndex].sets[setIndex];
      },
      removeTemplateSet: async (_, { templateId, exerciseIndex, setIndex }) => {
          const cache = await getRedisClient();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
      
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
          if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= template.exercises.length) {
              throw new GraphQLError("Invalid exerciseIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          const exercise = template.exercises[exerciseIndex];
          if (!Number.isInteger(setIndex) || setIndex < 0 || setIndex >= exercise.sets.length) {
              throw new GraphQLError("Invalid setIndex.", { extensions: { code: "BAD_USER_INPUT" } });
          }
      
          const removedSet = exercise.sets[setIndex];
      
          // $unset + $pull to remove null slot
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $unset: { [`exercises.${exerciseIndex}.sets.${setIndex}`]: 1 } }
          );
          await workoutTemplatesCollection.updateOne(
              { _id: templateObjId },
              { $pull: { [`exercises.${exerciseIndex}.sets`]: null } }
          );
      
          const updatedTemplate = await workoutTemplatesCollection.findOne({ _id: templateObjId });
          await cache.json.del(`workoutTemplates`);
          return removedSet;
      },
      setUserGoals: async (_, { userId, dailyCalorieTarget, proteinTarget, carbTarget, fatTarget, weightGoal, goalType }) => {
          const cache = await getRedisClient();
          const userGoalsCollection = await userGoalsCollectionFn();
    
          if (!(typeof userId === 'string') || !userId.trim()) {
              throw new GraphQLError("userId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
    
          const userObjId = new ObjectId(userId);
          const updateFields = {};
    
          if (dailyCalorieTarget !== undefined) updateFields.dailyCalorieTarget = dailyCalorieTarget;
          if (proteinTarget !== undefined) updateFields.proteinTarget = proteinTarget;
          if (carbTarget !== undefined) updateFields.carbTarget = carbTarget;
          if (fatTarget !== undefined) updateFields.fatTarget = fatTarget;
          if (weightGoal !== undefined) updateFields.weightGoal = weightGoal;
          if (goalType !== undefined) updateFields.goalType = goalType;
    
          if (Object.keys(updateFields).length === 0) {
            throw new GraphQLError("At least one goal field must be provided.", { extensions: { code: "BAD_USER_INPUT" } });
          }
    
          await userGoalsCollection.updateOne(
              { userId: userObjId },
              { $set: updateFields },
              { upsert: true }
          );
    
          const updatedGoals = await userGoalsCollection.findOne({ userId: userObjId });
    
          await cache.json.set(`goals/${userId}`, "$", updatedGoals);
          return updatedGoals;
      },
      scheduleWorkout: async (_, { userId, date, templateId }) => {
          const cache = await getRedisClient();
          const workoutsCollection = await workoutsCollectionFn();
          const exercisesCollection = await exercisesCollectionFn();
          const workoutTemplatesCollection = await workoutTemplatesCollectionFn();
          
          //error handling
          if (!(typeof userId === 'string') || !userId.trim()) {
              throw new GraphQLError("userId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          if (!date || isNaN(new Date(date))) {
              throw new GraphQLError("Invalid date format.", { extensions: { code: "BAD_USER_INPUT" } });
          }
          if (!(typeof templateId === 'string') || !templateId.trim()) {
              throw new GraphQLError("templateId must be a non-empty string.", { extensions: { code: "BAD_USER_INPUT" } });
          }
    
          const templateObjId = new ObjectId(templateId);
          const template = await workoutTemplatesCollection.findOne({ _id: templateObjId });
    
          //error handling
          if (!template) {
              throw new GraphQLError("Workout template not found.", { extensions: { code: "NOT_FOUND" } });
          }
    
          //newowkrout consists of the name, user id(aka in object form) , date, and the following exercises: []
         const newWorkout = {
              name: template.name,
              userId: new ObjectId(userId),
              date,
              exercises: []
          };
    
          const insertWorkout = await workoutsCollection.insertOne(newWorkout);
          //error handling
          if (!insertWorkout.acknowledged) {
              throw new GraphQLError("Failed to schedule workout.", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
          }
    
          const workoutId = insertWorkout.insertedId;
          newWorkout._id = workoutId.toString();
    
         const clonedExercises = template.exercises.map(ex => ({
              workoutId,
              name: ex.name,
              sets: ex.sets
          }));
    
          await exercisesCollection.insertMany(clonedExercises);
          await cache.json.del(`workouts/user/${userId}`);
          await cache.json.del(`exercises/workout/${workoutId.toString()}`);
          return newWorkout;
      }
    }
}
