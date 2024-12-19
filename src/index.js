import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import AuthController from "./controller/AuthController.js";
import ClinicController from "./controller/ClinicController.js";
import DoctorController from "./controller/DoctorController.js";
import PatientController from "./controller/PatientController.js";
import PatientProfileController from "./controller/PatientProfileController.js";
import HistoryBookingController from "./controller/HistoryBookingController.js";
import ScheduleController from "./controller/ScheduleContoller.js";
import NewsController from "./controller/News.js";
import questionAndAnswerController from "./controller/QuestionController.js";
import instructionRoutes from "./controller/InstructionController.js";
import contacts from "./controller/ContactController.js";
import notification from "./controller/NotificationController.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
export default app;

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("join_room", (room) => {
        socket.join(room);
        console.log("user join room", room);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

export const socket = io;

const authRoutes = new AuthController();
authRoutes.routes();
const clinicRoutes = new ClinicController();
clinicRoutes.routes();
const doctorRoutes = new DoctorController();
doctorRoutes.routes();
const patientRoutes = new PatientController();
patientRoutes.routes();
const patientProfileController = new PatientProfileController();
patientProfileController.routes();
const historyBookingController = new HistoryBookingController();
historyBookingController.routes();
const scheduleController = new ScheduleController();
scheduleController.routes();
const newsController = new NewsController();
newsController.routes();
questionAndAnswerController.routes();
instructionRoutes.routes();
contacts.routes();
notification.routes();
