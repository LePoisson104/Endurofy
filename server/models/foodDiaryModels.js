const { response } = require("express");
const pool = require("../utils/db");

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryGetAllFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetAllFood = async (userId, date) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query =
        "SELECT * FROM foodLog WHERE user_id = ? AND DATE(logged_at) = ?";
      pool.query(query, [userId, date], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results);
        }
      });
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryGetFavoriteFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetFavoriteFood = async (userId) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query =
        "SELECT fav_food_id, food_id, food_brand, food_name FROM favoriteFood WHERE user_id = ?";
      pool.query(query, [userId], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results);
        }
      });
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryGetIsFavoriteFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetIsFavoriteFood = async (userId, foodId) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) AS count 
        FROM favoriteFood 
        WHERE user_id = ? AND food_id = ?
      `;
      pool.query(query, [userId, foodId], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results[0].count > 0); // Return true if count > 0
        }
      });
    });
    return response; // Returns true if the food ID is in favorites
  } catch (err) {
    console.log(err.message);
    return false; // Return false in case of an error
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryGetLogDates
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetLogDates = async (userId, startDate, endDate) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query =
        "SELECT DISTINCT DATE(logged_at) as logged_date FROM (SELECT logged_at FROM foodLog WHERE user_id = ? AND DATE(logged_at) BETWEEN ? AND ? UNION SELECT logged_at FROM waterLog WHERE user_id = ? AND DATE(logged_at) BETWEEN ? AND ?) AS combined_logs ORDER BY logged_date";
      pool.query(
        query,
        [userId, startDate, endDate, userId, startDate, endDate],
        (err, results) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(results);
          }
        }
      );
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryAddFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryAddFood = async (
  foodId,
  userId,
  foodName,
  calories,
  protein,
  carbs,
  fat,
  servingSize,
  servingUnit,
  mealType,
  loggedAt
) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query =
        "INSERT INTO foodLog (food_id, user_id, food_name, calories, protein, carbs, fat, serving_size, serving_unit, meal_type, logged_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
      pool.query(
        query,
        [
          foodId,
          userId,
          foodName,
          calories,
          protein,
          carbs,
          fat,
          servingSize,
          servingUnit,
          mealType,
          loggedAt,
        ],
        (err, results) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(results);
          }
        }
      );
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryAddFavoriteFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryAddFavoriteFood = async (
  favFoodId,
  foodId,
  userId,
  foodName,
  foodBrand
) => {
  try {
    const reponse = await new Promise((resolve, reject) => {
      const query =
        "INSERT INTO favoriteFood (fav_food_id, food_id, user_id, food_name, food_brand) VALUES (?,?,?,?,?)";
      pool.query(
        query,
        [favFoodId, foodId, userId, foodName, foodBrand],
        (err, results) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(results);
          }
        }
      );
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryUpdateFoodByID
////////////////////////////////////////////////////////////////////////////////////////////////
const queryUpdateFood = async (foodId, updatePayload) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = "UPDATE foodLog SET ? WHERE food_id = ?";
      pool.query(query, [updatePayload, foodId], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results);
        }
      });
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryDeleteFoodById
////////////////////////////////////////////////////////////////////////////////////////////////
const queryDeleteFood = async (foodId) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = "DELETE FROM foodLog WHERE food_id = ?";
      pool.query(query, [foodId], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results);
        }
      });
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @queryDeleteFavoriteFood
////////////////////////////////////////////////////////////////////////////////////////////////
const queryDeleteFavoriteFood = async (favFoodId) => {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = "DELETE FROM favoriteFood WHERE fav_food_id = ?";
      pool.query(query, [favFoodId], (err, results) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(results);
        }
      });
    });
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  queryGetAllFood,
  queryGetFavoriteFood,
  queryGetLogDates,
  queryGetIsFavoriteFood,
  queryAddFood,
  queryAddFavoriteFood,
  queryUpdateFood,
  queryDeleteFood,
  queryDeleteFavoriteFood,
};
