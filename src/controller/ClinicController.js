import app from "../index.js";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import AuthController from "./AuthController.js";
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
    }
    async readTypeClinic(req, res) {
        try {
            const [rows] = await db.query(`SELECT * FROM clinictypes`);
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
            return res.status(200).json({
                data: rows,
                success: true,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }
    async createClinic(req, res) {
        try {
            // get the token from the request body
            const { name, address, phone, email, description, image, schedule, content, establish, type } = req.body;
            // create an instance of the UserService class
            const id = uuidv4();
            const [rows] = await db.query(
                `INSERT INTO clinics (id, name, address, phone, email, description, image, schedule, content, establish, type, createdBy) VALUES ('${id}', '${name}', '${address}', '${phone}', '${email}', '${description}', '${image}', '${
                    schedule || ""
                }', '${content || ""}', '${establish || ""}', '${type}', '${req.user.id}')`
            );
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tạo phòng khám thất bại",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Tạo phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }

    async getNumberClinic(req, res) {
        try {
            const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics`);
            const [publicClinic] = await db.query(`SELECT COUNT(*) as total FROM clinics WHERE isPublic = 1`);
            const privateClicic = parseInt(count[0].total) - parseInt(publicClinic[0].total);

            return res.status(200).json({
                data: { total: count[0].total, public: publicClinic[0].total, private: privateClicic },
                success: true,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }

    async readClinic(req, res) {
        try {
            // get the token from the request body
            const { id, page, limit, sort, search } = req.query;
            console.log(search);

            // create an instance of the UserService class
            if (id === "all") {
                //get clinic with pagination
                if (page && limit) {
                    const offset = (page - 1) * limit;
                    const [rows] = await db.query(
                        `
                        SELECT clinics.*, clinictypes.name as type, clinictypes.id as id_type 
                        FROM clinics 
                        INNER JOIN clinictypes ON clinictypes.id = clinics.type 
                        ${search ? `WHERE clinics.name LIKE '%${search}%' OR clinics.address LIKE '%${search}%'` : ""} 
                        ORDER BY clinics.${sort} ${sort === "createdAt" ? "DESC" : "ASC"} 
                        LIMIT ${limit} OFFSET ${offset}
                        `
                    );
                    const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics ${search ? `WHERE name LIKE '%${search}%' OR address LIKE '%${search}%'` : ""}`);
                    const total = count[0].total;
                    const totalPages = Math.ceil(total / limit);
                    if (rows.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Dữ liệu không tồn tại",
                        });
                    }

                    return res.status(200).json({
                        data: rows,
                        page: page,
                        success: true,
                        totalPages: totalPages,
                        message: "Tải dữ liệu thành công",
                    });
                }
                //get all clinics
                const [rows] = await db.query(`SELECT * FROM clinics`);
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Dữ liệu không tồn tại",
                    });
                }
                return res.status(200).json({
                    data: rows,
                    success: true,
                    message: "Tải dữ liệu thành công",
                });
            } else {
                //get clinic by id
                const [rows] = await db.query(`SELECT * FROM clinics WHERE id = ${id}`);
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Dữ liệu không tồn tại",
                    });
                }
                return res.status(200).json({
                    data: rows,
                    success: true,
                    message: "Tải dữ liệu thành công",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }

    async readClinicByType(req, res) {
        try {
            // get the token from the request body
            const { search, page, limit } = req.query;
            console.log(search, page, limit);

            //get clinic with pagination
            if (page && limit) {
                const offset = (page - 1) * limit;
                const [rows] = await db.query(
                    `
                        SELECT clinics.*, clinictypes.id as typeid, clinictypes.name as type FROM clinics 
                        INNER JOIN clinictypes ON clinics.type = clinictypes.id 
                        ${search !== "all" ? `WHERE clinictypes.id = '${search}'` : ""} and clinics.isPublic = 1
                        ORDER BY createdAt DESC 
                        LIMIT ${limit} 
                        OFFSET ${offset}
                    `
                );
                const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics INNER JOIN clinictypes on clinics.type = clinictypes.id WHERE clinictypes.id = '${search}'`);
                const total = count[0].total;
                const totalPages = Math.ceil(total / limit);

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: true,
                        message: "Dữ liệu không tồn tại",
                        data: [],
                    });
                }

                return res.status(200).json({
                    data: rows,
                    page: page,
                    success: true,
                    totalPages: totalPages,
                    message: "Tải dữ liệu thành công",
                });
            }
            //get all clinics
            const [rows] = await db.query(`SELECT * FROM clinics WHERE type = ${id}`);
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
            return res.status(200).json({
                data: rows,
                success: true,
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }

    async updateClinic(req, res) {
        try {
            const { id, name, address, phone, email, description, image, schedule, content, establish } = req.body;
            const [rows] = await db.query(
                `UPDATE clinics SET 
                    ${name ? `name = '${name}',` : ""} 
                    ${address ? `address = '${address}',` : ""} 
                    ${phone ? `phone = '${phone}',` : ""} 
                    ${email ? `email = '${email}',` : ""} 
                    ${description ? `description = '${description}',` : ""} 
                    ${image ? `image = '${image}',` : ""} 
                    ${schedule ? `schedule = '${schedule}',` : ""} 
                    ${content ? `content = '${content}',` : ""} 
                    ${establish ? `establish = '${establish}',` : ""} 
                    `.replace(/,\s*$/, "") + // Remove trailing comma
                    ` WHERE id = '${id}'`
            );
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cập nhật phòng khám thất bại",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Cập nhật phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }
    async deleteClinic(req, res) {
        try {
            const { id, name } = req.query;
            const [rows] = await db.query(`DELETE FROM clinics WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Xóa phòng khám thất bại",
                });
            }
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES ('${uuidv4()}', 'DELETE', 'Delete clinic id ${id} with name ${name}', '${
                    req.user.id
                }', 'DELETE FROM clinics WHERE id = ${id}')`
            );
            return res.status(200).json({
                success: true,
                message: "Xóa phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }

    async setPublic(req, res) {
        try {
            const { id, isPublic } = req.body;
            console.log(id, isPublic);

            const [rows] = await db.query(`UPDATE clinics SET isPublic = ${isPublic} WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cập nhật phòng khám thất bại",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Cập nhật phòng khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
            });
        }
    }
}
export default ClinicController;
