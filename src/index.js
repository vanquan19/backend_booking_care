import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { Server } from "socket.io";
import AuthController from "./controller/AuthController.js";
import ClinicController from "./controller/ClinicController.js";
import DoctorController from "./controller/DoctorController.js";
import PatientController from "./controller/PatientController.js";
import PatientProfileController from "./controller/PatientProfileController.js";
import HistoryBookingController from "./controller/HistoryBookingController.js";

const app = express();
export default app;

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const clinicNotification = {};

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("create-booking", (data) => {
        //increase notification count
        if (clinicNotification[data.clinicId]) {
            clinicNotification[data.clinicId] += 1;
        } else {
            clinicNotification[data.clinicId] = 1;
        }
        socket.broadcast.emit(`new-booking-${data.clinicId}`, {
            ...data,
            unRead: clinicNotification[data.clinicId],
        });
    });

    socket.on("view-bookings", (data) => {
        const clinicId = data.clinicId;

        // Đặt lại số lượng thông báo chưa đọc về 0
        if (clinicNotification[clinicId]) {
            clinicNotification[clinicId] = 0;
        }

        // Thông báo trạng thái mới
        socket.emit(`reset-notifications-${clinicId}`, {
            clinicId,
            unRead: 0,
        });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

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
