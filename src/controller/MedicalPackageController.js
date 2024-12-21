import app from "../index.js";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import AuthController from "./AuthController.js";
import bcrypt from "bcryptjs";
class MedicalPackageController {
    routes() {
        //CRUD medical pakage
        app.get("/api/v1/clinic/medical-package/read", this.readMedicalPackage);
        app.post("/api/v1/clinic/medical-package/create", AuthController.verifyToken, this.createMedicalPackage);
        app.put("/api/v1/clinic/medical-package/update", AuthController.verifyToken, this.updateMedicalPackage);
        app.delete("/api/v1/clinic/medical-package/delete", AuthController.verifyToken, this.deleteMedicalPackage);
        app.post("/api/v1/clinic/medical-package/set-public", AuthController.verifyToken, this.setPublicMedicalPackage);
        app.get("/api/v1/clinic/medical-package/read-public", this.readMedicalPackagePublic);

    }

   

    async readMedicalPackage(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;

            
            // Kiểm tra dữ liệu đầu vào
            if (!clinicId) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "clinicId là bắt buộc",
                });
            }
    
            // Giới hạn các trường cho phép sắp xếp để tránh SQL Injection
            const allowedSortFields = ['createdAt', 'name', 'price'];
            const orderBy = allowedSortFields.includes(sort) ? sort : 'createdAt';
            const orderDirection = orderBy === 'createdAt' ? 'DESC' : 'ASC';
    
            const offset = limit && page ? (page - 1) * parseInt(limit) : 0;
    
            // Truy vấn lấy dữ liệu gói khám và đếm public/private trong một câu lệnh
            const [rows] = await db.query(`
                SELECT 
                    clinics.id as clinicId, 
                    clinics.name as clinicName, 
                    clinics.star, 
                    clinics.schedule, 
                    clinics.address, 
                    clinics.description, 
                    examinationpackage.*, 
                    doctor.firstname, 
                    doctor.lastname,
                    SUM(CASE WHEN examinationpackage.isPublic = true THEN 1 ELSE 0 END) as publicCount,
                    SUM(CASE WHEN examinationpackage.isPublic = false THEN 1 ELSE 0 END) as privateCount
                FROM examinationpackage
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                INNER JOIN doctor ON doctor.id = examinationpackage.doctorId
                WHERE examinationpackage.clinicId = ?
                ${search ? `AND examinationpackage.name LIKE ?` : ""}
                GROUP BY examinationpackage.id
                ORDER BY ${orderBy} ${orderDirection}
                ${limit ? `LIMIT ? OFFSET ?` : ""}
            `, [
                clinicId,
                ...(search ? [`%${search}%`] : []),
                ...(limit ? [parseInt(limit), offset] : [])
            ]);
    
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
    
            // Tính tổng public và private từ kết quả
            const publicCount = rows.length > 0 ? rows[0].publicCount : 0;
            const privateCount = rows.length > 0 ? rows[0].privateCount : 0;
            const totalCount = publicCount + privateCount;
    
            return res.status(200).json({
                data: rows,
                isSuccess: true,
                public: publicCount,
                private: privateCount,
                count: totalCount,
                page: parseInt(page) || 1,
                totalPages: limit ? Math.ceil(totalCount / parseInt(limit)) : 1,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async createMedicalPackage(req, res) {
        try {
            const { name, clinicId, description, price, doctorId } = req.body;
    
            // Kiểm tra dữ liệu đầu vào
            if (!name || !clinicId || !price || !doctorId) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin gói khám (name, clinicId, price, doctorId).",
                });
            }
    
            // Kiểm tra định dạng price (phải là số dương)
            if (isNaN(price) || parseFloat(price) <= 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Giá gói khám phải là số lớn hơn 0.",
                });
            }
    
            const id = uuidv4();
    
            // Sử dụng prepared statement để tránh SQL Injection
            const [rows] = await db.query(
                `INSERT INTO examinationpackage (id, name, clinicId, description, price, doctorId) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [id, name, clinicId, description, price, doctorId]
            );
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo gói khám thất bại",
                });
            }
    
            return res.status(200).json({
                isSuccess: true,
                message: "Tạo gói khám thành công",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async updateMedicalPackage(req, res) {
        try {
            const { id, name, description, price, doctorId } = req.body;
    
            // Kiểm tra dữ liệu đầu vào
            if (!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng cung cấp ID của gói khám.",
                });
            }
    
            // Xây dựng các trường cập nhật
            const updateFields = [];
            const params = [];
    
            if (name) {
                updateFields.push("name = ?");
                params.push(name);
            }
            if (description) {
                updateFields.push("description = ?");
                params.push(description);
            }
            if (price) {
                // Kiểm tra giá trị price (phải là số dương)
                if (isNaN(price) || parseFloat(price) <= 0) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "Giá gói khám phải là số lớn hơn 0.",
                    });
                }
                updateFields.push("price = ?");
                params.push(price);
            }
            if (doctorId) {
                updateFields.push("doctorId = ?");
                params.push(doctorId);
            }
    
            // Nếu không có trường nào để cập nhật
            if (updateFields.length === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Không có trường nào để cập nhật.",
                });
            }
    
            // Câu lệnh SQL để cập nhật
            const updateQuery = `
                UPDATE examinationpackage 
                SET ${updateFields.join(", ")} 
                WHERE id = ?`;
    
            // Thêm id vào cuối params
            params.push(id);
    
            // Thực hiện truy vấn
            const [rows] = await db.query(updateQuery, params);
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật gói khám thất bại",
                });
            }
    
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật gói khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async deleteMedicalPackage(req, res) {
        try {
            const { id, name } = req.query;
    
            // Kiểm tra dữ liệu đầu vào
            if (!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng cung cấp ID của gói khám.",
                });
            }
    
            // Xóa gói khám
            const [rows] = await db.query(
                `DELETE FROM examinationpackage WHERE id = ?`,
                [id]
            );
            
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa gói khám thất bại",
                });
            }
    
            // Ghi lại hành động vào lịch sử
            const actionHistoryId = uuidv4();
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) 
                VALUES (?, 'DELETE', ?, ?, ?)`,
                [actionHistoryId, `Delete examinationpackage id ${id} with name ${name}`, req.user.id, `DELETE FROM examinationpackage WHERE id = ${id}`]
            );
    
            return res.status(200).json({
                isSuccess: true,
                message: "Xóa gói khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async setPublicMedicalPackage(req, res) {
        try {
            const { id, isPublic } = req.body;
    
            // Kiểm tra dữ liệu đầu vào
            if (!id || typeof isPublic !== 'boolean') {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng cung cấp ID và giá trị isPublic hợp lệ.",
                });
            }
    
            // Cập nhật trạng thái công khai của gói khám
            const [rows] = await db.query(
                `UPDATE examinationpackage SET isPublic = ? WHERE id = ?`,
                [isPublic, id]
            );
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật gói khám thất bại",
                });
            }
    
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật gói khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async readMedicalPackagePublic(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;
            
            // Kiểm tra dữ liệu đầu vào
            if (!clinicId) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng cung cấp ID phòng khám hợp lệ.",
                });
            }
    
            let offset = 0;
            if (limit && page) {
                offset = (page - 1) * limit;
            }
    
            const sortOrder = sort && sort !== "createdAt" ? "ASC" : "DESC";
    
            const [rows] = await db.query(`
                SELECT clinics.id as clinicId, clinics.name as clinicName, clinics.star, clinics.schedule, clinics.address, clinics.description, examinationpackage.* 
                FROM examinationpackage
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                WHERE examinationpackage.isPublic = true AND examinationpackage.clinicId = ?
                ${search ? `AND examinationpackage.name LIKE ?` : ""}
                ${sort ? `ORDER BY ${sort} ${sortOrder}` : ""}
                ${limit ? `LIMIT ? OFFSET ?` : ""}
            `, [
                clinicId,
                search ? `%${search}%` : undefined,
                limit ? parseInt(limit) : undefined,
                limit && page ? parseInt(offset) : undefined
            ]);
    
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: true,
                    data: [],
                    message: "Dữ liệu không tồn tại",
                });
            }
    
            return res.status(200).json({
                data: rows,
                isSuccess: true,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
}
export default new MedicalPackageController();
