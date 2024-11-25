import Doctor from "../model/Doctor.js";
import app from "../index.js";
import { v4 as uuidv4 } from "uuid";
import User from "../model/User.js";
import bcyptjs from "bcryptjs";
import AuthController from "./AuthController.js";
export default class DoctorController {
    //define the routes for the doctor
    routes() {
        app.get("/api/v1/doctor/read", this.readAllDoctor);
        app.get("/api/v1/doctor/read-public", this.readAllPublicDoctor);
        app.get("/api/v1/doctor/read/:id", this.readDoctorById);
        app.post("/api/v1/doctor/create", AuthController.verifyToken, this.createDoctor);
        app.put("/api/v1/doctor/update", AuthController.verifyToken, this.updateDoctor);
        app.delete("/api/v1/doctor/delete", AuthController.verifyToken, this.deleteDoctor);
        app.post("/api/v1/doctor/set-public", AuthController.verifyToken, this.setPublic);
    }

    //this method will be used for getting all doctors

    async readAllDoctor(req, res) {
        try {
            const { limit, page, sort, search, clinicId } = req.query;
            const doctor = new Doctor();
            const doctors = await doctor.getAllDoctor(sort, search, page, limit, clinicId);
            if (!doctors.isSuccess) {
                return res.status(404).json({
                    isSuccess: false,
                    message: doctors.message,
                });
            }
            return res.status(200).json(doctors);
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }

    async readAllPublicDoctor(req, res) {
        try {
            const { limit, page, sort, search, clinicId } = req.query;

            const doctor = new Doctor();
            const doctors = await doctor.getAllPublicDoctor(sort, search, page, limit, clinicId);
            if (!doctors.isSuccess) {
                return res.status(401).json({
                    isSuccess: false,
                    message: doctors.message,
                });
            }
            return res.status(200).json(doctors);
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }

    //this method will be used for getting a doctor by id
    async readDoctorById(req, res) {
        try {
            const { id } = req.params;
            const doctor = new Doctor();
            const doctors = await doctor.getDoctorById(id);
            if (!doctors.isSuccess) {
                return res.status(404).json({
                    isSuccess: false,
                    message: doctors.message,
                });
            }
            return res.status(200).json(doctors);
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }
    //this method will be used for creating a new doctor
    async createDoctor(req, res) {
        try {
            const { firstname, lastname, phone, email, position, specialize, clinicId, price } = req.body;
            if (!firstname || !lastname || !phone || !email || !position || !specialize || !clinicId) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng nhập đầy đủ thông tin!",
                });
            }

            const userId = uuidv4();
            const username = (firstname + lastname)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s/g, "");
            const password = bcyptjs.hashSync(phone, 10);
            const doctorId = uuidv4();
            const doctor = new Doctor(
                userId,
                username,
                password,
                "doctor",
                phone,
                email,
                "https://cdn-icons-png.flaticon.com/512/9703/9703596.png",
                null,
                doctorId,
                firstname,
                lastname,
                position,
                specialize,
                price,
                clinicId
            );
            const result = await doctor.createDoctor();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            console.log(result);

            return res.status(201).json({
                isSuccess: true,
                message: "Tạo bác sĩ thành công!",
            });
        } catch (error) {
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }

    //this method will be used for set public a doctor\
    async setPublic(req, res) {
        try {
            const { doctorId, isPublic } = req.body;
            console.log(doctorId, isPublic);

            const doctor = new Doctor();
            const result = await doctor.setPublic(isPublic, doctorId);
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật thành công!",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }

    //this method will be used for updating a doctor
    async updateDoctor(req, res) {
        try {
            const { id, firstname, lastname, phone, email, position, specialize, price } = req.body;

            if (!id || !firstname || !lastname || !phone || !email || !position || !specialize || !price) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng nhập đầy đủ thông tin!",
                });
            }
            const doctor = new Doctor();
            doctor.setId(id);
            doctor.setFirstname(firstname);
            doctor.setLastname(lastname);
            doctor.setPhone(phone);
            doctor.setEmail(email);
            doctor.setPosition(position);
            doctor.setSpecialize(specialize);
            doctor.setPrice(price);
            const result = await doctor.updateDoctor();
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật bác sĩ thành công!",
            });
        } catch (error) {
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }

    //this method will be used for deleting a doctor
    async deleteDoctor(req, res) {
        try {
            const { id, firstname, lastname } = req.query;
            console.log(id, firstname, lastname);

            const doctor = new Doctor();
            doctor.setId(id);
            doctor.setFirstname(firstname);
            doctor.setLastname(lastname);
            const result = await doctor.deleteDoctor(req.user.id);
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: `Xóa bác sĩ ${firstname} + ${lastname} thành công!`,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ isSuccess: false, message: error.message });
        }
    }
}
