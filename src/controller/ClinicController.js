import app from "../index.js";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import AuthController from "./AuthController.js";
import bcrypt from "bcryptjs";
class ClinicController {
    routes() {
        app.post("/api/v1/clinic/create", AuthController.verifyToken, this.createClinic);
        app.get("/api/v1/clinic/read", this.readClinic);
        app.put("/api/v1/clinic/update", AuthController.verifyToken, this.updateClinic);
        app.delete("/api/v1/clinic/delete", AuthController.verifyToken, this.deleteClinic);
        app.get("/api/v1/clinic/read-type", this.readTypeClinic);
        app.post("/api/v1/clinic/set-public", AuthController.verifyToken, this.setPublic);
        app.get("/api/v1/clinic/number", this.getNumberClinic);
        app.get("/api/v1/clinic/read-follow-type", this.readClinicByType);
        app.get("/api/v1/clinic/search-clinic", this.searchClinic);
        app.post("/api/v1/clinic/set-content", AuthController.verifyToken, this.setContentClinic);

        //get image of clinic
        app.get("/api/v1/clinic/image", this.getImageClinic);
    }

    async setContentClinic(req, res) {
        try {
            const { id, content } = req.body;
            const [rows] = await db.query(`UPDATE clinics SET content = ? WHERE id = ?`, [content, id]);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật nội dung thất bại",
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật nội dung thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }

    async searchClinic(req, res) {
        try {
            const { search, page, limit } = req.query;
            if (!search) {
                return res.status(400).json({
                    isSuccess: true,
                    data: [],
                    message: "Vui lòng nhập từ khóa tìm kiếm",
                });
            }
            const offset = (page - 1) * limit;
            let searchItem = `%${search}%`;
            const [rows] = await db.query(`SELECT * FROM clinics WHERE name LIKE ? OR address LIKE ? AND isPublic = 1 LIMIT ? OFFSET ?`, 
                [searchItem, searchItem, +limit, offset]
            );
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: true,
                    data: [],
                    message: "Dữ liệu không tồn tại",
                });
            }
            const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics WHERE name LIKE ? OR address LIKE ? AND isPublic = 1`, 
                [searchItem, searchItem]
            );
            const total = count[0].total;
            const totalPages = Math.ceil(total / limit);
            return res.status(200).json({
                data: rows,
                isSuccess: true,
                page: page,
                totalPages: totalPages,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async getImageClinic(req, res) {
        try {
            const { id } = req.query;
            const [rows] = await db.query(`SELECT image FROM imageclinic WHERE clinicId = ? AND isPublic = ?`, [id, 1]);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: true,
                    message: "Dữ liệu không tồn tại",
                });
            }

            const images = rows.map((item) => item.image);

            return res.status(200).json({
                data: images,
                isSuccess: true,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }
    async readTypeClinic(req, res) {
        try {
            const [rows] = await db.query(`SELECT * FROM clinictypes`);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
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
    async createClinic(req, res) {
        try {
            const { name, address, phone, email, description, image, schedule, content, establish, type, firstname, lastname } = req.body;
    
            // Kiểm tra thông tin đầu vào
            if (!name || !address || !phone || !email || !type || !firstname || !lastname) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng nhập đầy đủ thông tin",
                });
            }
    
            const username = (firstname + lastname)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s/g, "");
    
            const id = uuidv4();
            const password = await bcrypt.hash(phone, 10);
    
            // Thêm clinic
            const [clinicResult] = await db.query(
                `INSERT INTO clinics (id, name, address, phone, email, description, image, schedule, content, establish, type, createdBy) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, name, address, phone, email, description, image, schedule || "", content || "", establish || "", type, req.user.id]
            );
    
            if (clinicResult.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo phòng khám thất bại",
                });
            }
    
            const userId = uuidv4();
    
            // Thêm user
            const [userResult] = await db.query(
                `INSERT INTO users (id, email, phone, username, password, image, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, email, phone, username, password, 'https://cdn-icons-png.flaticon.com/512/9703/9703596.png', 'doctor']
            );
    
            if (userResult.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo tài khoản thất bại",
                });
            }
    
            // Thêm doctor
            const doctorId = uuidv4();
            const [doctorResult] = await db.query(
                `INSERT INTO doctor (id, firstname, lastname, position, userID, clinicId) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [doctorId, firstname, lastname, 'manager', userId, id]
            );
    
            return res.status(200).json({
                isSuccess: true,
                message: "Tạo phòng khám thành công",
            });
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    

    async getNumberClinic(req, res) {
        try {
            const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics`);
            const [publicClinic] = await db.query(`SELECT COUNT(*) as total FROM clinics WHERE isPublic = ?`, [1]);
            const privateClicic = parseInt(count[0].total) - parseInt(publicClinic[0].total);

            return res.status(200).json({
                data: { total: count[0].total, public: publicClinic[0].total, private: privateClicic },
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

    async readClinic(req, res) {
        try {
            const { id, page, limit, sort, search } = req.query;
    
            // Trường hợp lấy tất cả phòng khám với phân trang
            if (id === "all") {
                let query = `
                    SELECT clinics.*, clinictypes.name as type, clinictypes.id as id_type 
                    FROM clinics
                    INNER JOIN clinictypes ON clinictypes.id = clinics.type
                `;
    
                const queryParams = [];
                const countParams = [];
    
                // Tìm kiếm
                if (search) {
                    query += ` WHERE clinics.name LIKE ? OR clinics.address LIKE ?`;
                    queryParams.push(`%${search}%`, `%${search}%`);
                    countParams.push(`%${search}%`, `%${search}%`);
                }
    
                // Phân trang
                if (page && limit) {
                    const offset = (parseInt(page) - 1) * parseInt(limit);
                    query += ` ORDER BY clinics.${sort === "createdAt" ? "createdAt" : "name"} ${sort === "createdAt" ? "DESC" : "ASC"}`;
                    query += ` LIMIT ? OFFSET ?`;
                    queryParams.push(parseInt(limit), offset);
                }
    
                const [rows] = await db.query(query, queryParams);
    
                if (rows.length === 0) {
                    return res.status(404).json({
                        isSuccess: false,
                        message: "Dữ liệu không tồn tại",
                    });
                }
    
                // Lấy thông tin manager
                const [manager] = await db.query(`SELECT doctor.firstname, doctor.lastname FROM doctor WHERE clinicId = ? AND position = ?`, [rows[0].id, "manager"]);
    
                // Đếm tổng số kết quả
                const [count] = await db.query(
                    `SELECT COUNT(*) as total FROM clinics ${search ? `WHERE name LIKE ? OR address LIKE ?` : ""}`,
                    countParams
                );
    
                const total = count[0].total;
                const totalPages = Math.ceil(total / parseInt(limit));
    
                const data = rows.map((item) => ({
                    ...item,
                    firstname: manager[0]?.firstname || "",
                    lastname: manager[0]?.lastname || "",
                }));
    
                return res.status(200).json({
                    data: data,
                    page: parseInt(page),
                    isSuccess: true,
                    totalPages: totalPages,
                    message: "Tải dữ liệu thành công",
                });
            }
    
            // Trường hợp lấy phòng khám theo ID
            const [rows] = await db.query(
                `SELECT clinics.*, clinictypes.name as type FROM clinics
                 INNER JOIN clinictypes ON clinictypes.id = clinics.type
                 WHERE clinics.id = ?`,
                [id]
            );
    
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
    
            return res.status(200).json({
                data: rows[0],
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
    

    async readClinicByType(req, res) {
        try {
            const { search, page, limit } = req.query;
    
            // Xác thực và ép kiểu dữ liệu đầu vào
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const offset = (pageNum - 1) * limitNum;
    
            let whereClause = "WHERE clinics.isPublic = 1";
            const queryParams = [];
    
            if (search && search !== "all") {
                whereClause += " AND clinictypes.id = ?";
                queryParams.push(search);
            }
    
            // Truy vấn dữ liệu với phân trang
            const query = `
                SELECT clinics.*, clinictypes.id as typeid, clinictypes.name as type 
                FROM clinics 
                INNER JOIN clinictypes ON clinics.type = clinictypes.id 
                ${whereClause}
                ORDER BY clinics.createdAt DESC 
                LIMIT ? OFFSET ?
            `;
            queryParams.push(limitNum, offset);
    
            const [rows] = await db.query(query, queryParams);
    
            // Đếm tổng số kết quả
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM clinics 
                INNER JOIN clinictypes ON clinics.type = clinictypes.id 
                ${whereClause}
            `;
            const [countRows] = await db.query(countQuery, queryParams.slice(0, queryParams.length - 2));
            const total = countRows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);
    
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: true,
                    message: "Dữ liệu không tồn tại",
                    data: [],
                });
            }
    
            return res.status(200).json({
                data: rows,
                page: pageNum,
                isSuccess: true,
                totalPages: totalPages,
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
    

    async updateClinic(req, res) {
        try {
            const {
                id,
                name,
                address,
                phone,
                email,
                description,
                image,
                schedule,
                content,
                establish,
                firstname,
                lastname,
                type
            } = req.body;
    
            // Kiểm tra bắt buộc dữ liệu đầu vào
            if (!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "ID phòng khám là bắt buộc",
                });
            }
    
            // Chuẩn bị các trường cần cập nhật cho clinics
            const clinicFields = [];
            const clinicValues = [];
    
            if (name) {
                clinicFields.push("name = ?");
                clinicValues.push(name);
            }
            if (address) {
                clinicFields.push("address = ?");
                clinicValues.push(address);
            }
            if (phone) {
                clinicFields.push("phone = ?");
                clinicValues.push(phone);
            }
            if (email) {
                clinicFields.push("email = ?");
                clinicValues.push(email);
            }
            if (description) {
                clinicFields.push("description = ?");
                clinicValues.push(description);
            }
            if (image) {
                clinicFields.push("image = ?");
                clinicValues.push(image);
            }
            if (schedule) {
                clinicFields.push("schedule = ?");
                clinicValues.push(schedule);
            }
            if (content) {
                clinicFields.push("content = ?");
                clinicValues.push(content);
            }
            if (establish) {
                clinicFields.push("establish = ?");
                clinicValues.push(establish);
            }
            if (type) {
                clinicFields.push("type = ?");
                clinicValues.push(type);
            }
    
            if (clinicFields.length > 0) {
                clinicValues.push(id);
                const query = `UPDATE clinics SET ${clinicFields.join(", ")} WHERE id = ?`;
    
                const [rows] = await db.query(query, clinicValues);
    
                if (rows.affectedRows === 0) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "Cập nhật phòng khám thất bại",
                    });
                }
            }
    
            // Cập nhật thông tin manager trong bảng doctor nếu firstname và lastname có giá trị
            if (firstname || lastname) {
                const doctorFields = [];
                const doctorValues = [];
    
                if (firstname) {
                    doctorFields.push("firstname = ?");
                    doctorValues.push(firstname);
                }
                if (lastname) {
                    doctorFields.push("lastname = ?");
                    doctorValues.push(lastname);
                }
    
                if (doctorFields.length > 0) {
                    doctorValues.push(id);
                    const doctorQuery = `UPDATE doctor SET ${doctorFields.join(", ")} WHERE clinicId = ?`;
    
                    const [rows2] = await db.query(doctorQuery, doctorValues);
    
                    if (rows2.affectedRows === 0) {
                        return res.status(400).json({
                            isSuccess: false,
                            message: "Cập nhật thông tin bác sĩ thất bại",
                        });
                    }
                }
            }
    
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    
    async deleteClinic(req, res) {
        try {
            const { id, name } = req.query;
    
            // Kiểm tra id có được cung cấp hay không
            if (!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "ID phòng khám là bắt buộc",
                });
            }
    
            // Xóa phòng khám với prepared statement
            const [rows] = await db.query(`DELETE FROM clinics WHERE id = ?`, [id]);
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa phòng khám thất bại",
                });
            }
    
            // Ghi log hành động với prepared statement
            const actionMessage = `Delete clinic id ${id} with name ${name || 'N/A'}`;
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES (?, 'DELETE', ?, ?, ?)`,
                [uuidv4(), actionMessage, req.user.id, `DELETE FROM clinics WHERE id = ${id}`]
            );
    
            return res.status(200).json({
                isSuccess: true,
                message: "Xóa phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }

    async setPublic(req, res) {
        try {
            const { id, isPublic } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!id || typeof isPublic !== 'boolean') {
                return res.status(400).json({
                    isSuccess: false,
                    message: "ID và trạng thái isPublic là bắt buộc và phải hợp lệ",
                });
            }
    
            // Cập nhật trạng thái với prepared statement
            const [rows] = await db.query(`UPDATE clinics SET isPublic = ? WHERE id = ?`, [isPublic, id]);
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật phòng khám thất bại hoặc phòng khám không tồn tại",
                });
            }
    
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật phòng khám thành công",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                isSuccess: false,
                message: "Lỗi server",
            });
        }
    }
    

   
}
export default ClinicController;
