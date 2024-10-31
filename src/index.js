import express from "express";
import dotenv from "dotenv";
dotenv.config();
import AuthController from "./controller/AuthController.js";
import cors from "cors";
import ClinicController from "./controller/ClinicController.js";

const app = express();
export default app;
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = new AuthController();
authRoutes.routes();

const clinicRoutes = new ClinicController();
clinicRoutes.routes();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
