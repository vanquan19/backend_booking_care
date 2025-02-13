import Schedule from "../model/Schedule.js";
import AuthController from "./AuthController.js";
import app from "../index.js";

class ScheduleController {
    routes() {
        app.get("/api/v1/schedule", AuthController.verifyToken, this.getSchedule);
        app.get("/api/v1/schedule/calendar", this.getScheduleClient);
    }

    async getSchedule(req, res) {
        try {
            const { month = null, year = null, clinicId, doctorId } = req.query;
            const schedule = new Schedule();
            schedule.setMonth(month);
            schedule.setYear(year);
            const result = await schedule.getSchedule(clinicId, doctorId);
            if (result.isSuccess) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Error when getting schedule",
            });
        }
    }

    async getScheduleClient(req, res) {
        try {
            const { clinicId, doctorId, date, month, year, amount } = req.query;
            const schedule = new Schedule();
            schedule.setMonth(month);
            schedule.setYear(year);
            const result = await schedule.getScheduleWithOffTime(clinicId, doctorId, amount);
            if (!result.isSuccess) {
                throw new Error(result.message);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Error when getting schedule",
            });
        }
    }
}

export default ScheduleController;
