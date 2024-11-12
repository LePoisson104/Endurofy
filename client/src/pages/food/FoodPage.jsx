import { Box, Typography } from "@mui/material";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import FoodCalendar from "../../components/FoodCalendar";
import Header from "../../components/global/Header";
import AccordionUsage from "../../components/accordion/AccordionUsage";
import NutrientDoughnutChart from "../../components/charts/NutrientDoughnutChart";
import WaterAccordion from "../../components/accordion/WaterAccordion";
import useAuth from "../../hooks/useAuth";
import { useGetAllUsersInfoQuery } from "../../features/users/usersApiSlice";
import { MACROS } from "../../helper/macrosConstants";
import { useGetAllFoodByDateQuery } from "../../features/food/foodApiSlice";
import { useEffect, useState } from "react";
import { foodServingsHelper } from "../../helper/foodServingsHelper";

const FoodPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { userId } = useAuth();
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("en-CA") // Formats as "YYYY-MM-DD"
  );

  const userData = useGetAllUsersInfoQuery(userId).data;
  const { data, error, refetch, isFetching } = useGetAllFoodByDateQuery({
    userId,
    currentDate,
  });

  // Set allFoodData to empty if error is 404 or while fetching, else use the fetched data
  const allFoodData = error?.status === 404 || isFetching ? [] : data || [];

  // Optional: useEffect to log or perform actions on date changes
  useEffect(() => {
    // Trigger refetch whenever `currentDate` changes, if needed
    refetch();
  }, [currentDate, refetch]);

  const totalCalBurned =
    Math.round(userData?.BMR * parseFloat(userData?.activity_level)) +
    userData?.BMR;
  const BMRPercent = Math.round((userData?.BMR / totalCalBurned) * 100);
  const baselinePercent = Math.round(
    (Math.round(userData?.BMR * parseFloat(userData?.activity_level)) /
      totalCalBurned) *
      100
  );

  const adjustedFoodData = allFoodData?.map((food) =>
    foodServingsHelper({
      serving: food.serving_size,
      unit: food.serving_unit,
      foodData: { ...food },
    })
  );

  // if there are food data then calculate the total calories of all food else 0 kcal is consumed
  const calculateTotal = (data, key, roundToDecimal = false) =>
    data
      ? Math.round(
          data.reduce((total, item) => total + item[key], 0) *
            (roundToDecimal ? 100 : 1)
        ) / (roundToDecimal ? 100 : 1)
      : 0;

  const totalCaloriesConsumed = calculateTotal(adjustedFoodData, "calories");
  const totalProteinConsumed = calculateTotal(
    adjustedFoodData,
    "protein",
    true
  );
  const totalCarbsConsumed = calculateTotal(adjustedFoodData, "carbs", true);
  const totalFatConsumed = calculateTotal(adjustedFoodData, "fat", true);

  const totalCalOfProtein = Math.round(totalProteinConsumed * MACROS.protein);
  const totalCalOfCarbs = Math.round(totalCarbsConsumed * MACROS.carbs);
  const totalCalOfFat = Math.round(totalFatConsumed * MACROS.fat);

  let remainingCalories = userData?.calories_target - totalCaloriesConsumed;

  const [calRemainTitle, setCalRemainTitle] = useState("Remaining");

  useEffect(() => {
    if (remainingCalories < 0) {
      setCalRemainTitle("Over");
    } else {
      setCalRemainTitle("Remaining");
    }
  }, [remainingCalories]);

  const progressColors = {
    Energy: "#9a9ff1",
    Protein: "#68afac",
    Carbs: "#66b7cd",
    Fat: "#FFCC8A",
  };

  const chartsData = {
    data1: {
      datasets: [
        {
          data: [
            totalFatConsumed || 100,
            totalProteinConsumed,
            totalCarbsConsumed,
          ], // Example values, adjust as needed
          backgroundColor:
            totalFatConsumed === 0 &&
            totalProteinConsumed === 0 &&
            totalCarbsConsumed === 0
              ? ["#D3D3D3", "#D3D3D3", "#D3D3D3"] // Colors for Fat, Protein, Carbs
              : ["#FFCC8A", "#68afac", "#66b7cd"], // Gray color when no data
          hoverBackgroundColor:
            totalFatConsumed === 0 &&
            totalProteinConsumed === 0 &&
            totalCarbsConsumed === 0
              ? ["#D3D3D3", "#D3D3D3", "#D3D3D3"] // Colors for Fat, Protein, Carbs
              : ["#FFCC8A", "#68afac", "#66b7cd"], // Gray color when no data
        },
      ],
      totalCalories: totalCaloriesConsumed,
    },
    data2: {
      datasets: [
        {
          data: [BMRPercent, baselinePercent], // Example values, adjust as needed
          backgroundColor: ["#9a9ff1", "#70d8bd"],
          hoverBackgroundColor: ["#9a9ff1 ", "#70d8bd"],
        },
      ],
      totalCalories: totalCalBurned,
    },
    data3: {
      datasets: [
        {
          data: [100], // Example values, adjust as needed
          backgroundColor: ["#9a9ff1"],
          hoverBackgroundColor: ["#9a9ff1"],
        },
      ],
      totalCalories: Math.abs(remainingCalories),
    },
  };

  const MacroItems = ({ title, amount, targetAmount }) => {
    const percent = Math.round(
      (parseInt(amount.split("g")) / parseInt(targetAmount.split("g"))) * 100
    );

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={600}>{title}</Typography>
        {/* outerbar */}

        <Box>
          <Box
            sx={{
              width: { xl: "500px", lg: "300px", md: "200px" },
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography>
              {amount} / {targetAmount}
            </Typography>
            <Typography>{percent}%</Typography>
          </Box>
          <Box
            sx={{
              width: "100% ",
              height: "14px",
              backgroundColor: "rgb(216, 216, 216)",
              borderRadius: "7px",
              overflow: "hidden",
            }}
          >
            {/* inner bar */}
            <Box
              sx={{
                width: `${percent}%`,
                backgroundColor: `${progressColors[title]}`, // Directly use title as key
                height: "14px",
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box m="20px" sx={{ display: "flex", flexDirection: "column" }}>
      <Header title="Diary" subtitle="Your daily food intake and summary" />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "column", lg: "row" },
        }}
      >
        {/* Left Box (food input) */}
        <Box
          backgroundColor={colors.primary[400]}
          sx={{
            width: { md: "100%", lg: "80%" },
            padding: "20px",
            marginRight: "20px",
          }}
          id="left"
        >
          <Box>
            <WaterAccordion />
            <AccordionUsage
              title={"Uncategorized"}
              data={adjustedFoodData?.filter(
                (food) => food.meal_type === "uncategorized"
              )}
              originalData={allFoodData?.filter(
                (food) => food.meal_type === "uncategorized"
              )}
              currentDate={currentDate}
            />
            <AccordionUsage
              title={"Breakfast"}
              data={adjustedFoodData?.filter(
                (food) => food.meal_type === "breakfast"
              )}
              originalData={allFoodData?.filter(
                (food) => food.meal_type === "breakfast"
              )}
              currentDate={currentDate}
            />
            <AccordionUsage
              title={"Lunch"}
              data={adjustedFoodData?.filter(
                (food) => food.meal_type === "lunch"
              )}
              originalData={allFoodData?.filter(
                (food) => food.meal_type === "lunch"
              )}
              currentDate={currentDate}
            />
            <AccordionUsage
              title={"Dinner"}
              data={adjustedFoodData?.filter(
                (food) => food.meal_type === "dinner"
              )}
              originalData={allFoodData?.filter(
                (food) => food.meal_type === "dinner"
              )}
              currentDate={currentDate}
            />
            <AccordionUsage
              title={"Snacks"}
              data={adjustedFoodData?.filter(
                (food) => food.meal_type === "snack"
              )}
              originalData={allFoodData?.filter(
                (food) => food.meal_type === "snack"
              )}
              currentDate={currentDate}
            />
          </Box>
          <Box
            sx={{ width: "100%", borderTop: "1px solid #888", mb: 3, mt: 3 }}
          ></Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              mt: 3,
              height: "25vh",
            }}
          >
            {/* Energy Summary */}
            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h3" fontWeight={500} sx={{ mb: 5 }}>
                Summary Charts
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  height: "15.6vh",
                }}
              >
                <NutrientDoughnutChart
                  title={"Consumed"}
                  data={chartsData.data1}
                  setAnimation={false}
                />
                <NutrientDoughnutChart
                  title={"Burned"}
                  data={chartsData.data2}
                />
                <NutrientDoughnutChart
                  title={calRemainTitle}
                  data={chartsData.data3}
                />
              </Box>
            </Box>
            {/* Vertical line */}
            <Box sx={{ borderLeft: "1px solid #888", ml: 2, mr: 2 }}></Box>
            {/* Macro Targets */}
            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Hard code change it later */}
              <Typography variant="h3" fontWeight={500} sx={{ mb: 5 }}>
                Macronutrient Targets
              </Typography>
              <Box>
                <MacroItems
                  title={"Energy"}
                  amount={`${totalCaloriesConsumed} kcal`}
                  targetAmount={`${userData?.calories_target} kcal`}
                />
                <MacroItems
                  title={"Protein"}
                  amount={`${totalProteinConsumed} g`}
                  targetAmount={`${Math.floor(
                    (userData?.calories_target * userData?.protein) /
                      100 /
                      MACROS.protein
                  )} g`}
                />
                <MacroItems
                  title={"Carbs"}
                  amount={`${totalCarbsConsumed} g`}
                  targetAmount={`${Math.floor(
                    (userData?.calories_target * userData?.carbs) /
                      100 /
                      MACROS.carbs
                  )} g`}
                />
                <MacroItems
                  title={"Fat"}
                  amount={`${totalFatConsumed} g`}
                  targetAmount={`${Math.floor(
                    (userData?.calories_target * userData?.fat) /
                      100 /
                      MACROS.fat
                  )} g`}
                />
              </Box>
            </Box>
          </Box>
          <Box
            sx={{ width: "100%", borderTop: "1px solid #888", mb: 3, mt: 3 }}
          ></Box>
          {/* Energy Summary */}
          <Typography variant="h3" fontWeight={500} sx={{ mb: 2 }}>
            Energy Summary
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Calories Consumed (kcal) */}
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "33.33%" }}
            >
              <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
                Calories Consumed (kcal)
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#68afac" }}
                >
                  Protein
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "30%",
                  }}
                >
                  <Typography variant="h6">{totalCalOfProtein} kcal</Typography>
                  <Typography variant="h6">
                    {allFoodData.length !== 0
                      ? Math.round(
                          (totalCalOfProtein / totalCaloriesConsumed) * 100
                        )
                      : 0}
                    %
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#66b7cd" }}
                >
                  Carbs
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "30%",
                  }}
                >
                  <Typography variant="h6">{totalCalOfCarbs} kcal</Typography>
                  <Typography variant="h6">
                    {allFoodData.length !== 0
                      ? Math.round(
                          (totalCalOfCarbs / totalCaloriesConsumed) * 100
                        )
                      : 0}
                    %
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#FFCC8A" }}
                >
                  Fat
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "30%",
                  }}
                >
                  <Typography variant="h6">{totalCalOfFat} kcal</Typography>
                  <Typography variant="h6">
                    {allFoodData.length !== 0
                      ? Math.round(
                          (totalCalOfFat / totalCaloriesConsumed) * 100
                        )
                      : 0}
                    %
                  </Typography>
                </Box>
              </Box>
            </Box>
            {/* Vertical line */}
            <Box sx={{ borderLeft: "1px solid #888", ml: 2, mr: 2 }}></Box>
            {/* Calories Burned (kcal) */}
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "33.33%" }}
            >
              <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
                Calories Burned (kcal)
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#9a9ff1" }}
                >
                  Basal Metabolic Rate (BMR)
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "30%",
                  }}
                >
                  <Typography variant="h6">{userData?.BMR} kcal</Typography>
                  <Typography variant="h6">{BMRPercent}%</Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#70d8bd" }}
                >
                  Baseline Activiy
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "30%",
                  }}
                >
                  <Typography variant="h6">
                    {Math.round(
                      userData?.BMR * parseFloat(userData?.activity_level)
                    )}{" "}
                    kcal
                  </Typography>
                  <Typography variant="h6">{baselinePercent}%</Typography>
                </Box>
              </Box>
            </Box>
            {/* Vertical line */}
            <Box sx={{ borderLeft: "1px solid #888", ml: 2, mr: 2 }}></Box>
            {/* Energy Target*/}
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "33.33%" }}
            >
              <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
                Energy Target
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Target</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    {userData?.calories_target} kcal
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Consumed</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    -{totalCaloriesConsumed} kcal
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#9a9ff1" }}
                >
                  {calRemainTitle}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    {Math.abs(remainingCalories)} kcal
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Right Box (calendar) */}
        <Box
          backgroundColor={colors.primary[400]}
          sx={{
            width: { xl: "20%", lg: "25%" },
            padding: "20px",
            position: { md: "sticky" },
            top: 70,
            height: "100%",
          }}
          id="right"
        >
          <FoodCalendar setCurrentDate={setCurrentDate} />
        </Box>
      </Box>
    </Box>
  );
};

export default FoodPage;
