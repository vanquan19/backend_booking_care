import app from "../index.js";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import AuthController from "./AuthController.js";
class SpecialtyController {
    routes() {
        app.get("/api/v1/clinic/specialty/read", this.readSpecialty);
        app.get("/api/v1/clinic/specialty/read-public", this.readSpecialtyPublic);
        app.post("/api/v1/clinic/specialty/create", AuthController.verifyToken, this.createSpecialty);
        app.put("/api/v1/clinic/specialty/update", AuthController.verifyToken, this.updateSpecialty);
        app.delete("/api/v1/clinic/specialty/delete", AuthController.verifyToken, this.deleteSpecialty);
        app.post("/api/v1/clinic/specialty/set-public", AuthController.verifyToken, this.setPublicSpecialty);

    }

    //CRUD specialty
    async readSpecialty(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;
            let offset = 0;

            if (!clinicId) {
                return;
            }
            if (limit && page) {
                offset = (page - 1) * limit;
            }
            const baseQuery = `
                    SELECT clinics.isPublic, clinics.id as clinicId, specialty.* 
                    FROM specialty
                    INNER JOIN clinics ON clinics.id = specialty.clinicId
                    WHERE specialty.clinicId = ?
                    ${search ? "AND specialty.name LIKE ?" : ""}
                    ${sort ? "ORDER BY ? ?" : ""}
                    ${limit ? "LIMIT ? OFFSET ?" : ""}
                `;

            const queryParams = [clinicId];
            if (search) queryParams.push(`%${search}%`);
            if (sort) {
                const [sortField, sortOrder] = sort.split(' ');
                queryParams.push(sortField, sortOrder === "ASC" ? "ASC" : "DESC");
            }
            if (limit) queryParams.push(parseInt(limit), parseInt(offset));
    
            const [rows] = await db.query(baseQuery, queryParams);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
            const countQuery = `
            SELECT 
                SUM(CASE WHEN specialty.isPublic = true THEN 1 ELSE 0 END) as public,
                SUM(CASE WHEN specialty.isPublic = false THEN 1 ELSE 0 END) as private
            FROM specialty
            INNER JOIN clinics ON clinics.id = specialty.clinicId
            WHERE specialty.clinicId = ?
            ${search ? "AND specialty.name LIKE ?" : ""}
        `;
        
        const countParams = [clinicId];
        if (search) countParams.push(`%${search}%`);

        const [countResult] = await db.query(countQuery, countParams);
        const publicCount = +countResult[0].public;
        const privateCount = +countResult[0].private;
        return res.status(200).json({
            data: rows,
            isSuccess: true,
            public: publicCount,
            private: privateCount,
            count: publicCount + privateCount,
            page: page,
            totalPages: Math.ceil((publicCount + privateCount) / limit),
            message: "Data loaded successfully",
        });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async readSpecialtyPublic(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;
            let offset = 0;
            if (!clinicId) {
                return;
            }
            if (limit && page) {
                offset = (page - 1) * limit;
            }

            const baseQuery = `
                SELECT clinics.id as clinicId, clinics.name as clinicName, clinics.star, clinics.schedule, clinics.address, clinics.description, specialty.* 
                FROM specialty
                INNER JOIN clinics ON clinics.id = specialty.clinicId
                WHERE specialty.isPublic = true AND specialty.clinicId = ?
                ${search ? "AND specialty.name LIKE ?" : ""}
                ${sort ? "ORDER BY ?? ??" : ""}
                ${limit ? "LIMIT ? OFFSET ?" : ""}
            `;

            const queryParams = [clinicId];
            if (search) queryParams.push(`%${search}%`);
            if (sort) {
                const [sortField, sortOrder] = sort.split(' ');
                queryParams.push(sortField, sortOrder === "ASC" ? "ASC" : "DESC");
            }
            if (limit) queryParams.push(parseInt(limit), parseInt(offset));

            const [rows] = await db.query(baseQuery, queryParams);
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
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async createSpecialty(req, res) {
        try {
            const { name, clinicId, description } = req.body;
            console.log(req.body);

            const id = uuidv4();
            const insertQuery = `
                INSERT INTO specialty (id, name, clinicId, description)
                VALUES (?, ?, ?, ?)
            `;

            const queryParams = [id, name, clinicId, description];

            const [rows] = await db.query(insertQuery, queryParams);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo chuyên khoa thất bại",
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Tạo chuyên khoa thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async updateSpecialty(req, res) {
        try {
            const { id, name, description } = req.body;
                  // Validate input data
            if (!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng gửi id hợp lệ",
                });
            }

            // Prepare the fields to be updated
            const updateFields = [];
            const queryParams = [];

            if (name) {
                updateFields.push("name = ?");
                queryParams.push(name);
            }

            if (description) {
                updateFields.push("description = ?");
                queryParams.push(description);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "No fields to update",
                });
            }

            // Append the WHERE clause
            const updateQuery = `
                UPDATE specialty SET 
                ${updateFields.join(", ")} 
                WHERE id = ?
            `;

            queryParams.push(id); // Add id for WHERE clause

            const [rows] = await db.query(updateQuery, queryParams);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật chuyên khoa thất bại",
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật chuyên khoa thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async deleteSpecialty(req, res) {
        try {
            const { id, name } = req.query;
            const [rows] = await db.query(
                `DELETE FROM specialty WHERE id = ?`, [id]
            );
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa chuyên khoa thất bại",
                });
            }
        
            const actionHistoryQuery = `
                INSERT INTO actionhistory (id, action, name, createdBy, query)
                VALUES (?, 'DELETE', ?, ?, ?)
            `;
            const actionHistoryParams = [
                uuidv4(),
                `Delete specialty id ${id} with name ${name}`,
                req.user.id,
                `DELETE FROM specialty WHERE id = ${id}`
            ];

            await db.query(actionHistoryQuery, actionHistoryParams);
            return res.status(200).json({
                isSuccess: true,
                message: "Xóa chuyên khoa thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

    async setPublicSpecialty(req, res) {
        try {
            const { id, isPublic } = req.body;
            if(!id) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng gửi id hợp lệ",
                });
            }
            const [rows] = await db.query(
                `UPDATE specialty SET isPublic = ? WHERE id = ?`, [isPublic, id]
            );
    
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật chuyên khoa thất bại",
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Cập nhật chuyên khoa thành công",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }

  
}
export default new SpecialtyController();
