import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import NutrientDoughnutChart from "../../components/charts/NutrientDoughnutChart";
import { tokens } from "../../theme";
import { findFoodMacros } from "../../helper/findFoodMacros";
import { MACROS } from "../../helper/macrosConstants";
import { foodServingsHelper } from "../../helper/foodServingsHelper";
import {
  useAddFoodMutation,
  useEditFoodMutation,
} from "../../features/food/foodApiSlice";
import useAuth from "../../hooks/useAuth";
import FavoriteButton from "../buttons/FavoriteButton";
import { useSelector } from "react-redux";
import ErrorAlert from "../alerts/ErrorAlert";
import { toKcal } from "../../helper/toKcal";
import CustomFoodDeleteBtn from "../buttons/CustomFoodDeleteBtn";
import { errorResponse } from "../../helper/errorResponse";

const FoodMacrosModal = ({ open, onClose, food, title, type, mode }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { userId } = useAuth();

  const [unit, setUnit] = useState("");
  const [serving, setServing] = useState("");
  const [foodData, setFoodData] = useState({});

  const [addFood, { isLoading: isAddFoodLoading }] = useAddFoodMutation();
  const [editFood, { isLoading: isEditFoodLoading }] = useEditFoodMutation();

  const [errMsg, setErrMsg] = useState("");

  const { currentDate, startDate, endDate } = useSelector(
    (state) => state.dateRange
  );

  let Kcal = 0;
  // make a copy of the original data this data be alter and you don't want the alter data to be store in the db
  let updatedFoodObject;

  if (type === "edit") {
    // if edit make a copy of the read only object
    updatedFoodObject = { ...food };
  }

  const isEmptyObject = (obj) => Object.keys(obj).length === 0;

  if (title === "Snacks") {
    title = "snack";
  }

  // Set unit and serving size based on food data if editing
  useEffect(() => {
    if (open && food) {
      if (type === "edit" && food) {
        setUnit(food?.serving_unit);
        setServing(food?.serving_size);
        const calculatedData = foodServingsHelper({
          serving: updatedFoodObject?.serving_size,
          unit: updatedFoodObject?.serving_unit,
          foodData: updatedFoodObject,
        });
        setFoodData(calculatedData);
        // Mark as initialized
      } else if (type === "custom" && food) {
        setUnit(`${food?.serving_size}${food?.serving_unit}`);
        setServing(1);
      } else {
        setUnit(food?.servingSizeUnit ? `100${food?.servingSizeUnit}` : "100g");
        setServing(1);
      }
    } else {
      setUnit("");
    }
  }, [food, type, open]);

  if (type !== "edit" && type !== "custom") {
    if (findFoodMacros(food, "Energy")?.unitName === "kJ") {
      Kcal = toKcal(findFoodMacros(food, "Energy")?.value);
    } else {
      Kcal = findFoodMacros(food, "Energy")?.value;
    }
  }

  let initialFoodData = {};

  if (type !== "edit" && type !== "custom") {
    initialFoodData = {
      calories: Kcal,
      protein: findFoodMacros(food, "Protein")?.value || 0,
      proteinUnit:
        findFoodMacros(food, "Protein")?.unitName.toLowerCase() || "g",
      carbs:
        findFoodMacros(food, "Carbohydrate, by difference", "Starch")?.value ||
        0,
      carbsUnit:
        findFoodMacros(
          food,
          "Carbohydrate, by difference",
          "Starch"
        )?.unitName.toLowerCase() || "g",
      fat: findFoodMacros(food, "Total lipid (fat)")?.value || 0,
      fatUnit:
        findFoodMacros(food, "Total lipid (fat)")?.unitName.toLowerCase() ||
        "g",
    };

    if (
      initialFoodData.calories === undefined &&
      initialFoodData.protein !== undefined &&
      initialFoodData.carbs !== undefined &&
      initialFoodData.fat !== undefined
    ) {
      initialFoodData.calories = Math.round(
        initialFoodData.protein * MACROS.protein +
          initialFoodData.carbs * MACROS.carbs +
          initialFoodData.fat * MACROS.fat
      );
    }
  } else if (type === "custom") {
    initialFoodData = {
      calories: food?.calories,
      protein: food?.protein,
      carbs: food?.carbs,
      fat: food?.fat,
      servingSize: food?.serving_size,
    };
  }

  // Set foodData based on unit and serving
  useEffect(() => {
    if (food) {
      const foodData = isEmptyObject(initialFoodData)
        ? updatedFoodObject
        : initialFoodData;

      // Ensure food is loaded before calculating foodData
      setFoodData(foodServingsHelper({ serving, unit, foodData }));
    }
  }, [food, unit, serving]);

  const isDataEmpty = !foodData?.fat && !foodData?.protein && !foodData?.carbs;

  const data = {
    datasets: [
      {
        data: isDataEmpty
          ? [100, 0, 0] // Single gray circle
          : [foodData?.fat || 0, foodData?.protein || 0, foodData?.carbs || 0],
        backgroundColor: isDataEmpty
          ? ["#d3d3d3", "#d3d3d3", "#d3d3d3"] // Gray when no data
          : ["#FFCC8A", "#68afac", "#66b7cd"],
        hoverBackgroundColor: isDataEmpty
          ? ["#d3d3d3", "#d3d3d3", "#d3d3d3"] // Gray when no data
          : ["#FFCC8A", "#68afac", "#66b7cd"],
      },
    ],
    totalCalories: Math.round(foodData?.calories) || 0,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let foodPayload;

    if (type !== "edit" && type !== "custom") {
      foodPayload = {
        fdcId: food.fdcId,
        foodName: food.description,
        foodBrand: food.brandName ? food.brandName : "unknown",
        servingSize: serving,
        servingUnit: unit,
        calories: initialFoodData.calories,
        protein: initialFoodData.protein,
        carbs: initialFoodData.carbs,
        fat: initialFoodData.fat,
        mealType: title.toLowerCase(),
        loggedAt: currentDate,
      };
    } else if (type === "custom") {
      foodPayload = {
        foodName: food.food_name,
        foodBrand: food.food_brand,
        fdcId: food.custom_food_id,
        servingSize: serving,
        servingUnit: unit,
        calories: initialFoodData.calories,
        protein: initialFoodData.protein,
        carbs: initialFoodData.carbs,
        fat: initialFoodData.fat,
        mealType: title.toLowerCase(),
        loggedAt: currentDate,
      };
    } else {
      foodPayload = {
        serving_size: serving,
        serving_unit: unit,
      };
    }

    try {
      if (type !== "edit") {
        await addFood({
          userId,
          currentDate,
          startDate,
          endDate,
          foodPayload,
        }).unwrap();
      } else {
        await editFood({
          userId,
          currentDate,
          foodId: updatedFoodObject?.food_id,
          updatePayload: foodPayload,
        });
      }
      onClose(true);
    } catch (err) {
      errorResponse(err, setErrMsg);
    }
  };

  const menuItemValues = [
    type === "edit" ? food?.serving_unit : undefined,
    type === "custom"
      ? `${food?.serving_size}${food?.serving_unit}`
      : undefined,
    type !== "edit" && type !== "custom" && food?.servingSizeUnit
      ? `100${food?.servingSizeUnit}`
      : undefined,
    "100g", // Default value
    "g",
    "oz",
  ];
  // Remove undefined values and duplicates using Set
  const uniqueValues = [...new Set(menuItemValues.filter(Boolean))];

  return (
    <>
      {errMsg && (
        <ErrorAlert message={errMsg} duration={4000} setErrMsg={setErrMsg} />
      )}
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: "550px",
            margin: "auto",
            mt: 20,
            p: 3,
            bgcolor: colors.primary[400],
            borderRadius: "8px",
            boxShadow: 24,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {type !== "edit" && type !== "custom" ? (
              <Typography variant="h5" fontWeight={600}>
                {food?.brandName ? `(${food.brandName}) ` : ""}{" "}
                {food?.description}
              </Typography>
            ) : (
              <Typography variant="h5" fontWeight={600}>
                {food?.food_brand === "unknown" ? "" : `(${food.food_brand}) `}
                {food?.food_name}
              </Typography>
            )}

            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Horizontal line */}
          <Box sx={{ width: "100%", borderTop: "1px solid #888", mb: 3 }}></Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <NutrientDoughnutChart data={data} setAnimation={false} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5">
                <Box
                  sx={{
                    display: "inline-block",
                    width: "15px",
                    height: "15px",
                    backgroundColor: "#68afac",
                    borderRadius: "50%",
                    mr: 1,
                  }}
                />
                Protein: {foodData?.protein?.toFixed(2)}{" "}
                {foodData?.proteinUnit ? foodData?.proteinUnit : "g"}
                <span style={{ color: "#68afac" }}>
                  {" "}
                  (
                  {Math.round(
                    (foodData?.protein /
                      (foodData?.protein + foodData?.carbs + foodData?.fat)) *
                      100
                  ) || 0}
                  %)
                </span>
              </Typography>
              <Typography variant="h5">
                <Box
                  sx={{
                    display: "inline-block",
                    width: "15px",
                    height: "15px",
                    backgroundColor: "#66b7cd",
                    borderRadius: "50%",
                    mr: 1,
                  }}
                />
                Carbs: {foodData?.carbs?.toFixed(2)}{" "}
                {foodData?.carbsUnit ? foodData?.carbsUnit : "g"}
                <span style={{ color: "#66b7cd" }}>
                  {" "}
                  (
                  {Math.round(
                    (foodData?.carbs /
                      (foodData?.protein + foodData?.carbs + foodData?.fat)) *
                      100
                  ) || 0}
                  %)
                </span>
              </Typography>
              <Typography variant="h5">
                <Box
                  sx={{
                    display: "inline-block",
                    width: "15px",
                    height: "15px",
                    backgroundColor: "#FFCC8A",
                    borderRadius: "50%",
                    mr: 1,
                  }}
                />
                Fat: {foodData?.fat?.toFixed(2)}{" "}
                {foodData?.fatUnit ? foodData?.fatUnit : "g"}
                <span style={{ color: "#FFCC8A" }}>
                  {" "}
                  (
                  {Math.round(
                    (foodData?.fat /
                      (foodData?.protein + foodData?.carbs + foodData?.fat)) *
                      100
                  ) || 0}
                  %)
                </span>
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{ width: "100%", borderTop: "1px solid #888", mb: 3, mt: 3 }}
          ></Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              justifyContent: "center ",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ display: "flex", alignItems: "center", mr: 2 }}
            >
              Serving size:
            </Typography>
            <TextField
              value={serving || ""}
              inputProps={{ max: 1000, min: 0 }}
              type="number"
              onChange={(e) => {
                let value = parseInt(e.target.value);

                if (value < 0) {
                  value = 0;
                } else if (value > 1000) {
                  value = 1000;
                } else if (isNaN(value)) {
                  value = 0;
                }

                setServing(value);
              }}
              sx={{
                width: "70px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6d76fa",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6d76fa",
                  },
                },
                "& input[type=number]": {
                  MozAppearance: "textfield", // Firefox
                },
                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none", // Chrome, Safari, Edge, Opera
                    margin: 0,
                  },
              }}
            />
            <FormControl sx={{ width: "150px" }}>
              <InputLabel
                id="demo-simple-select-label"
                sx={{
                  "&.Mui-focused": {
                    color: "#6d76fa",
                  },
                }}
              >
                Unit
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={unit}
                label="Unit"
                onChange={(e) => setUnit(e.target.value)}
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6d76fa", // Border color on hover
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6d76fa",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: colors.primary[400], // Background color for the dropdown
                    },
                  },
                }}
              >
                {uniqueValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FavoriteButton food={food} />
            {mode === "custom" && (
              <CustomFoodDeleteBtn
                customFoodId={food?.custom_food_id}
                closeModal={onClose}
              />
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Button
              disabled={isAddFoodLoading || isEditFoodLoading}
              type="submit"
              sx={{
                width: "100px",
                textTransform: "none",
                color: "white",
                backgroundColor: "#6d76fa",
                "&:hover": {
                  backgroundColor: "#868dfb",
                },
              }}
            >
              {!(isAddFoodLoading || isEditFoodLoading) &&
                (type === "edit" ? "Update" : "Add")}
              {(isAddFoodLoading || isEditFoodLoading) && (
                <CircularProgress sx={{ color: "white" }} size={"20px"} />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default FoodMacrosModal;
