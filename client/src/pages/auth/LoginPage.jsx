import { Button, Box, TextField, Typography, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../features/auth/authApiSlice";
import { setCredentials } from "../../features/auth/authSlice";
import PasswordField from "../../components/PasswordField";
import ForgotPasswordModal from "../../components/modals/ForgotPassModal";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CircularProgress from "@mui/material/CircularProgress";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const emailRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  const handleEmailInput = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { accessToken } = await login({ email, password }).unwrap();
      dispatch(setCredentials({ accessToken }));
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else if (err.status === 400) {
        setErrMsg(err.data?.message);
      } else if (err.status === 401 || err.status === 404) {
        setErrMsg("Incorrect email or password. Try again.");
      } else {
        setErrMsg(err.data?.message);
      }
    }
  };

  return (
    <Box
      sx={{
        position: "relative", // Allows absolute positioning of the logo
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: colors.grey[1000],
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 40,
          left: 60,
        }}
      >
        {/* Logo */}
        <Typography
          variant="h4" // Smaller variant for mobile
          fontWeight="400"
          sx={{
            cursor: "pointer",
            fontSize: {
              xs: "20px", // Mobile: Smaller font
              md: "28px", // Desktop: Larger font
            },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="purple-style">Fit</span>
            <span className="grey-style">Tracker</span>
          </Link>
        </Typography>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "none",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <Typography
          variant="h3"
          mb={3}
          mt={4}
          fontWeight="bold"
          color="#6d76fa"
        >
          Log In
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            textTransform: "none",
            width: "100%",
            fontSize: 16,
            borderRadius: 1,
            mb: 3,
            mt: 3,
            bgcolor: "white",
            border: "1px solid #DEDEDE",
            "&:hover": {
              border: "1px solid #DEDEDE",
            },
          }}
        >
          Continue with Google
        </Button>
        <Box
          sx={{ width: "100%", borderTop: "1px solid #D4D4D4", mb: 3 }}
        ></Box>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            mb: 1,
          }}
        >
          <Typography fontWeight={500}>Email</Typography>
        </Box>
        <TextField
          id="email"
          label="Please enter your email address"
          variant="outlined"
          type="email"
          inputRef={emailRef}
          onChange={handleEmailInput}
          required
          sx={{
            mb: 3,
            width: "100%",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: errMsg ? "red" : "grey", // Default border color
              },
              "&:hover fieldset": {
                borderColor: errMsg ? "red" : "#868dfb", // Border color on hover
              },
              "&.Mui-focused fieldset": {
                borderColor: errMsg ? "red" : "#3c47f9", // Border color when focused
              },
            },
            "& .MuiInputLabel-root": {
              color: errMsg ? "red" : "grey", // Default label color
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: errMsg ? "red" : "#868dfb", // Label color when focused
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            mb: 1,
          }}
        >
          <Typography fontWeight={500}>Password</Typography>
          <ForgotPasswordModal />
        </Box>
        <PasswordField
          id="password"
          label="Please enter your password"
          value={password}
          setValue={setPassword}
          fieldName="password"
          validate={false} // Disable validation
          errMsg={errMsg ? true : false}
        />
        {errMsg && (
          <Box
            sx={{
              display: "flex",
              color: "red",
              width: "100%",
              mt: 2,
              flexDirection: "row",
            }}
          >
            <PriorityHighIcon fontSize="small" />
            <Typography>{errMsg}</Typography>
          </Box>
        )}
        <Button
          type="submit"
          sx={{
            textTransform: "none",
            width: "100%",
            background: "#6d76fa",
            color: "white",
            mb: 3,
            mt: 2,
            "&:hover": {
              backgroundColor: "#868dfb",
            },
          }}
        >
          {!isLoading && <Typography>Log In</Typography>}
          {isLoading && <CircularProgress size={20} sx={{ color: "white" }} />}
        </Button>
        <Button
          component={Link}
          to="/signup"
          sx={{
            textTransform: "none",
            width: "100%",
            color: "#6d76fa",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Or Sign Up
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
