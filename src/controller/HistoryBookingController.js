import { v4 as uuidv4 } from "uuid";
import AuthController from "./AuthController.js";
import HistoryBooking from "../model/HistoryBooking.js";
import app from "../index.js";

export default class HistoryBookingController {
    routes() {
        app.post("/api/v1/create-history-booking", AuthController.verifyToken, this.createHistoryBooking);
        app.get("/api/v1/get-history-booking", AuthController.verifyToken, this.getHistoryBooking);
        app.get("/api/v1/get-history-booking-by-status", AuthController.verifyToken, this.getHistoryBookingByStatus);
        app.post("/api/v1/update-status-history-booking", AuthController.verifyToken, this.updateStatusHistoryBooking);
        app.get("/api/v1/get-amount-booking-by-status", AuthController.verifyToken, this.getAmountBookingByStatus);
        app.get("/api/v1/get-history-booking-search", AuthController.verifyToken, this.getHistoryBookingSearch);
    }
    async createHistoryBooking(req, res) {
        try {
            const { clinicId, specialtyId, profileId, doctorId, pakageId, time, date, month, year } = req.body;
            const id = uuidv4();
            const patientId = req.user.id;
            const historyBooking = new HistoryBooking(id, clinicId, specialtyId, profileId, patientId, doctorId, pakageId, time, date, month, year);
            const result = await historyBooking.createHistoryBooking();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Tạo phiếu khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getHistoryBookingByStatus(req, res) {
        const { clinicId, status } = req.query;
        const historyBooking = new HistoryBooking();
        historyBooking.setClinicId(clinicId);
        historyBooking.setStatus(status);
        const result = await historyBooking.getHistoryBookingByStatus();
        if (!result.isSuccess) {
            return res.status(400).json({
                isSuccess: false,
                message: result.message,
            });
        }
        return res.status(200).json({
            isSuccess: true,
            data: result.data,
        });
    }

    async updateStatusHistoryBooking(req, res) {
        try {
            const { id, status } = req.body;
            const historyBooking = new HistoryBooking();
            historyBooking.setID(id);
            historyBooking.setStatus(status);
            const result = await historyBooking.updateStatusHistoryBooking();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật trạng thái phiếu khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getAmountBookingByStatus(req, res) {
        const { clinicId } = req.query;
        const historyBooking = new HistoryBooking();
        historyBooking.setClinicId(clinicId);
        const result = await historyBooking.getAmountBookingByStatus();
        if (!result.isSuccess) {
            return res.status(400).json({
                isSuccess: false,
                message: result.message,
            });
        }
        return res.status(200).json({
            isSuccess: true,
            data: result.data,
        });
    }

    async getHistoryBookingSearch(req, res) {
        const { clinicId, search } = req.query;

        const historyBooking = new HistoryBooking();
        historyBooking.setClinicId(clinicId);
        const result = await historyBooking.getHistoryBookingSearch(search);

        if (!result.isSuccess) {
            return res.status(400).json({
                isSuccess: false,
                message: result.message,
            });
        }
        return res.status(200).json({
            isSuccess: true,
            data: result.data,
        });
    }

    async getHistoryBooking(req, res) {
        const { userId } = req.body;
        const historyBooking = new HistoryBooking();
        const result = await historyBooking.getHistoryBooking(userId);
        res.json(result);
    }
}
