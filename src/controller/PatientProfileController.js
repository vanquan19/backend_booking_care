import app from "../index.js";
import { PatientProfile } from "../model/PatientProfile.js";
import AuthController from "./AuthController.js";
import { v4 as uuidv4 } from "uuid";
export default class PatientProfileController {
    routes() {
        app.post("/api/v1/create-patient-profile", AuthController.verifyToken, this.createPatientProfile);
        app.get("/api/v1/get-patient-profile", AuthController.verifyToken, this.getPatientProfile);
        app.delete("/api/v1/delete-patient-profile", AuthController.verifyToken, this.deletePatientProfile);
        app.get("/api/v1/get-patient-profile-by-id", AuthController.verifyToken, this.getPatientProfileById);
        app.put("/api/v1/update-patient-profile", AuthController.verifyToken, this.updatePatientProfile);
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

    getPatientProfileById = async (req, res) => {
        try {
            const { id } = req.query;
            const patientProfile = new PatientProfile();
            patientProfile.setID(id);
            const result = await patientProfile.getPatientProfileById();
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

    updatePatientProfile = async (req, res) => {
        try {
            const { id, name, phone, email, address, province, district, ward, birthday, sex, job, ethnic, identify } = req.body;
            const patientProfile = new PatientProfile();
            patientProfile.setID(id);
            patientProfile.setName(name);
            patientProfile.setPhone(phone);
            patientProfile.setEmail(email);
            patientProfile.setAddress(address);
            patientProfile.setProvince(province);
            patientProfile.setDistrict(district);
            patientProfile.setWard(ward);
            patientProfile.setBirthday(birthday);
            patientProfile.setSex(sex);
            patientProfile.setJob(job);
            patientProfile.setEthnic(ethnic);
            patientProfile.setIdentity(identify);
            const result = await patientProfile.updatePatientProfile();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật hồ sơ thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    };

    deletePatientProfile = async (req, res) => {
        try {
            const { id } = req.body;
            const patientProfile = new PatientProfile();
            patientProfile.setID(id);
            const result = await patientProfile.deletePatientProfile();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Xóa hồ sơ thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    };
}
