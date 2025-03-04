import { useState, useEffect } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  menuClasses,
  sidebarClasses,
} from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import UserAvatar from "../../components/UserAvatar";
import SportsGymnasticsIcon from "@mui/icons-material/SportsGymnastics";

// SidebarItem.js
const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // We can wrap the MenuItem with a div or span to properly forward the ref
  return (
    <Tooltip
      title={
        <Typography sx={{ fontSize: "13px", padding: "5px" }}>
          {title}
        </Typography>
      }
      arrow
      disableHoverListener={!isCollapsed}
    >
      <div>
        {" "}
        {/* Wrapping the MenuItem with a div to apply Tooltip correctly */}
        <MenuItem
          active={selected === to}
          style={{
            color: colors.grey[100],
          }}
          onClick={() => {
            setSelected(to);
            navigate(to); // Use navigate for routing
          }}
          icon={icon}
          rootStyles={{
            [`.${menuClasses.active}`]: {
              color: "#868dfb",
            },
            [`.${menuClasses.button}`]: {
              "&:hover": {
                [`.${menuClasses.icon}`]: {
                  color: "#868dfb",
                },
                [`.${menuClasses.label}`]: {
                  color: "#868dfb",
                },
              },
            },
          }}
        >
          {!isCollapsed && <Typography>{title}</Typography>}
        </MenuItem>
      </div>
    </Tooltip>
  );
};

const SideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarState")) ?? false
  );
  // const [selected, setSelected] = useState("Dashboard");
  const sidebarWidth = isCollapsed ? "80px" : "250px"; // Adjust these values as needed

  // Use React Router's location to detect the current URL path
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarState", JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const savedSidebarState = JSON.parse(localStorage.getItem("sidebarState"));
    if (savedSidebarState !== null) {
      setIsCollapsed(savedSidebarState);
    }
  }, []);

  // Update `selected` state if location changes
  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  return (
    <Sidebar
      collapsed={isCollapsed}
      backgroundColor={colors.primary[400]}
      rootStyles={{
        [`.${sidebarClasses.container}`]: {
          position: "fixed",
          width: sidebarWidth,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Menu
        iconShape="square"
        rootStyles={{
          [`.${menuClasses.button}`]: {
            "&:hover": {
              backgroundColor: "transparent",
              color: "#868dfb",
            },
          },
          // Center the menu items when collapsed
          [`.${menuClasses.icon}`]: {
            margin: isCollapsed ? "0 auto" : "0",
          },
        }}
      >
        {/* LOGO AND MENU ICON */}
        <MenuItem
          onClick={toggleSidebar}
          icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
          rootStyles={{
            margin: "10px 0 10px 0", // top right bottom left
            color: colors.grey[100],
          }}
        >
          {!isCollapsed && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  color:
                    theme.palette.mode === "dark"
                      ? "white"
                      : colors.purpleAccent[400],
                }}
              >
                Endurofy
              </Typography>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSidebar();
                }}
              >
                <MenuOutlinedIcon />
              </IconButton>
            </Box>
          )}
        </MenuItem>
        <Box
          sx={{
            width: "100%",
            borderTop: `1px solid ${
              theme.palette.mode === "dark" ? "#4e5a65" : "#e0e0e0"
            }`,
          }}
        ></Box>

        <Box mb={"30px"}>
          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark" ? "darkgray" : colors.grey[500]
            }
            sx={{
              m: "15px 0 5px 0",
              display: "block",
              textAlign: isCollapsed ? "center" : "left",
              padding: isCollapsed ? "0" : "0 0 0 20px",
              fontSize: isCollapsed ? "12px" : "none",
            }}
          >
            Overview
          </Typography>
          <Item
            title="Dashboard"
            to="/dashboard"
            icon={<GridViewIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark" ? "darkgray" : colors.grey[500]
            }
            sx={{
              m: "15px 0 5px 0",
              display: "block",
              textAlign: isCollapsed ? "center" : "left",
              padding: isCollapsed ? "0" : "0 0 0 20px",
              fontSize: isCollapsed ? "12px" : "none",
            }}
          >
            Diary
          </Typography>
          <Item
            title="Food Diary"
            to="/food"
            icon={<RamenDiningOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
            rootStyles={{ backgroundColor: "blue" }}
          />
          <Item
            title="Weight Tracker"
            to="/weight"
            icon={<MonitorWeightOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
          <Item
            title="Workout Log"
            to="/workout"
            icon={<SportsGymnasticsIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />

          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark" ? "darkgray" : colors.grey[500]
            }
            sx={{
              m: "15px 0 5px 0",
              display: "block",
              textAlign: isCollapsed ? "center" : "left",
              padding: isCollapsed ? "0" : "0 0 0 20px",
              fontSize: isCollapsed ? "12px" : "none",
            }}
          >
            Account
          </Typography>
          <Item
            title="Profile"
            to="/profile"
            icon={<PersonOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
          <Item
            title="Calendar"
            to="/calendar"
            icon={<CalendarTodayOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
          <Item
            title="Settings"
            to="/settings"
            icon={<SettingsOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark" ? "darkgray" : colors.grey[500]
            }
            sx={{
              m: "15px 0 5px 0",
              display: "block",
              textAlign: isCollapsed ? "center" : "left",
              padding: isCollapsed ? "0" : "0 0 0 20px",
              fontSize: isCollapsed ? "12px" : "none",
            }}
          >
            Reports
          </Typography>
          <Item
            title="Report Summary"
            to="/bar"
            icon={<BarChartOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
            isCollapsed={isCollapsed}
          />
        </Box>
      </Menu>
      <UserAvatar isCollapsed={isCollapsed} />
    </Sidebar>
  );
};

export default SideBar;
