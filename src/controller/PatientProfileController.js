import app from "../index.js";
import { PatientProfile } from "../model/PatientProfile.js";
import AuthController from "./AuthController.js";
import { v4 as uuidv4 } from "uuid";
export default class PatientProfileController {
    routes() {
        app.post("/api/v1/create-patient-profile", AuthController.verifyToken, this.createPatientProfile);
        app.get("/api/v1/get-patient-profile", AuthController.verifyToken, this.getPatientProfile);
    }

    createPatientProfile = async (req, res) => {
        try {
            const { name, phone, email, address, province, district, ward, birthday, sex, job, ethnic, identify } = req.body;

            if (!name || !phone || !email || !address || !province || !district || !ward || !birthday || !sex || !job || !ethnic || !identify) {
                return res.status(400).json({ isSuccess: false, message: "Missing required fields" });
            }
            const userId = req.user.id;
            const id = uuidv4();
            const patientProfile = new PatientProfile(id, name, phone, email, address, province, district, ward, birthday, sex, job, ethnic, identify, userId);
            const result = await patientProfile.createPatientProfile();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Tạo hồ sơ thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    };

    getPatientProfile = async (req, res) => {
        try {
            const userId = req.user.id;
            const patientProfile = new PatientProfile();
            const result = await patientProfile.getPatientProfile(userId);
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            console.log(result.data);

            return res.status(200).json({
                isSuccess: true,
                data: result.data,
                message: "Lấy hồ sơ thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    };
}
