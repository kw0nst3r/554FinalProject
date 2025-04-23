import {GraphQLError} from 'graphql';
import {users as usersCollectionFn, 
        workouts as workoutsCollectionFn, 
        exercises as exercisesCollectionFn,
        workoutTemplates as workoutTemplatesCollectionFn,
        calorieEntries as calorieEntriesCollectionFn,
        bodyWeightEntries as bodyWeightCollectionFn,
        userGoals as userGoalsCollectionFn,
        personalRecords as personalRecordsCollectionFn} 
from "./MongoConfig/mongoCollections.js";
import {v4 as uuid} from "uuid";
import { ObjectId } from "mongodb"
import getRedisClient from "./redisClient.js"

export const resolvers = {
    Mutation: {
        addUser: async (_, {name, bodyWeight}) => {
            const cache = await getRedisClient();
            // Validate Inputs
            // Name Validation - It should be a string
            if(!name.trim()){
                throw new GraphQLError(`Name cannot be empty or just spaces.`, {
                    extensions: {code: 'BAD_USER_INPUT'}});
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
            // next, create user object
            let newUser = {name: name, bodyWeight: bodyWeight};
            let insert = await usersCollection.insertOne(newUser);
            if (!insert.acknowledged || !insert.insertedId) {
                throw new GraphQLError(`Could not Add User`, { extensions: { code: "INTERNAL_SERVER_ERROR" }});
            }
            newUser._id = insert.insertedId.toString();
            await cache.json.set(`users/${newUser._id}`, "$", newUser);
            await cache.json.del(`users`);
            return newUser;
        },
        editUser: async (_, {_id, name, bodyWeight}) => {
            const cache = await getRedisClient();
            // first step is to get the mongodb connection
            const usersCollection = await usersCollectionFn();
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
                if(!name.trim()){
                    throw new GraphQLError(`Name term cannot be empty or just spaces.`, {extensions: {code: 'BAD_USER_INPUT'}});
                } 
                updatedFields.name = name.trim();
            }
            if(bodyWeight !== undefined){
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
            let updatedUser = await usersCollection.findOne({ _id });await cache.json.set(`users/${_id.toString()}`, "$", updatedUser);
            await cache.json.del(`users`);
            return updatedUser;
        },
        removeUser: async (_, {_id}) => {
            const cache = await getRedisClient();
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
              user: new ObjectId(userId),
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
            await cache.json.del(`calories/user/${editEntry.user.toString()}`);
            return updated;
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
              user: new ObjectId(userId),
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
            await cache.json.del(`weights/user/${original.user.toString()}`);
            return updated;
          },

    }
}