import {dbConnection} from './mongoConnection.js';

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
export const users = getCollectionFn('users');
export const workouts = getCollectionFn('workouts');
export const exercises = getCollectionFn('exercises');
export const workoutTemplates = getCollectionFn('workoutTemplates');
export const calorieEntries = getCollectionFn('calorieEntries');
export const bodyWeightEntries = getCollectionFn('bodyWeightEntries');
export const userGoals = getCollectionFn('userGoals');
export const personalRecords = getCollectionFn('personalRecords');
export const workoutRoutines = getCollectionFn('workoutRoutines');
