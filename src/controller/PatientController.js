import app from "../index.js";
import Patient from "../model/Patient.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();

export default class PatientController {
    routes() {
        app.get("/api/v1/check-phone", this.checkPhoneExist);
        app.post("/api/v1/create-patient", this.createPatient);
    }
    async checkPhoneExist(req, res) {
        console.log(req.query);
        const { phone } = req.query;
        const patient = new Patient(null, null, phone, null);
        const result = await patient.checkPhoneExist();
        if (!result.isSuccess) {
            return res.status(404).json(result);
        }
        const data = {
            name: result.data.name,
            phone: result.data.phone,
            email: result.data.email,
            address: result.data.address,
        };
        const refreshToken = jwt.sign({ id: result.data.id, name: result.data.name, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "1w" });
        const accessToken = jwt.sign({ id: result.data.id, name: result.data.name, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            isSuccess: true,
            message: "Đăng nhập thành công",
            data: data,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    }
    async createPatient(req, res) {
        const { name, phone, email, address } = req.body;
        console.log(req.body);

        const id = uuidv4();
        const patient = new Patient(id, name, phone, email, address);
        const result = await patient.createPatient();
        if (!result.isSuccess) {
            return res.status(404).json(result);
        }
        const data = {
            name,
            phone,
            email,
            address,
        };
        const asessToken = jwt.sign({ id: id, name: name, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: id, name: name, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            isSuccess: true,
            message: "Tạo tài khoản thành công",
            data: data,
            asessToken: asessToken,
            refreshToken: refreshToken,
        });
    }
}
