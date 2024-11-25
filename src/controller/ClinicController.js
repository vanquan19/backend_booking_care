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
        //CRUD specialty
        app.get("/api/v1/clinic/specialty/read", this.readSpecialty);
        app.get("/api/v1/clinic/specialty/read-public", this.readSpecialtyPublic);
        app.post("/api/v1/clinic/specialty/create", AuthController.verifyToken, this.createSpecialty);
        app.put("/api/v1/clinic/specialty/update", AuthController.verifyToken, this.updateSpecialty);
        app.delete("/api/v1/clinic/specialty/delete", AuthController.verifyToken, this.deleteSpecialty);
        app.post("/api/v1/clinic/specialty/set-public", AuthController.verifyToken, this.setPublicSpecialty);

        //CRUD medical pakage
        app.get("/api/v1/clinic/medical-package/read", this.readMedicalPackage);
        app.post("/api/v1/clinic/medical-package/create", AuthController.verifyToken, this.createMedicalPackage);
        app.put("/api/v1/clinic/medical-package/update", AuthController.verifyToken, this.updateMedicalPackage);
        app.delete("/api/v1/clinic/medical-package/delete", AuthController.verifyToken, this.deleteMedicalPackage);
        app.post("/api/v1/clinic/medical-package/set-public", AuthController.verifyToken, this.setPublicMedicalPackage);
        app.get("/api/v1/clinic/medical-package/read-public", this.readMedicalPackagePublic);

        //get image of clinic
        app.get("/api/v1/clinic/image", this.getImageClinic);
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
            const [rows] = await db.query(`SELECT * FROM clinics WHERE name LIKE '%${search}%' OR address LIKE '%${search}%' AND isPublic = 1 LIMIT ${limit} OFFSET ${offset}`);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: true,
                    data: [],
                    message: "Dữ liệu không tồn tại",
                });
            }
            const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics WHERE name LIKE '%${search}%' OR address LIKE '%${search}%' AND isPublic = 1`);
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
            const [rows] = await db.query(`SELECT image FROM imageclinic WHERE clinicId = '${id}' AND isPublic = 1`);
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
            // get the token from the request body
            const { name, address, phone, email, description, image, schedule, content, establish, type, firstname, lastname } = req.body;
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
            // create an instance of the UserService class
            const id = uuidv4();
            const [rows] = await db.query(
                `INSERT INTO clinics (id, name, address, phone, email, description, image, schedule, content, establish, type, createdBy) VALUES ('${id}', '${name}', '${address}', '${phone}', '${email}', '${description}', '${image}', '${
                    schedule || ""
                }', '${content || ""}', '${establish || ""}', '${type}', '${req.user.id}')`
            );
            //password is phone
            const password = await bcrypt.hash(phone, 10);

            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo phòng khám thất bại",
                });
            }
            const userId = uuidv4();
            const [rows2] = await db.query(
                `INSERT INTO users (id, email, phone, username, password, image, role) VALUES ('${userId}', '${email}', '${phone}', '${username}', '${password}', 'https://cdn-icons-png.flaticon.com/512/9703/9703596.png', 'doctor')`
            );
            if (rows2.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Tạo tài khoản thất bại",
                });
            }
            const [rows3] = await db.query(
                `INSERT INTO doctor (id, firstname, lastname, position, userID, clinicId) VALUES ('${uuidv4()}', '${firstname}', '${lastname}', 'managar', '${userId}', '${id}')`
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
            const [publicClinic] = await db.query(`SELECT COUNT(*) as total FROM clinics WHERE isPublic = 1`);
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
            // get the token from the request body
            const { id, page, limit, sort, search } = req.query;
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

                    const [manager] = await db.query(`SELECT doctor.firstname, doctor.lastname FROM doctor WHERE clinicId = '${rows[0].id}' AND position = 'manager'`);

                    if (rows.length === 0) {
                        return res.status(404).json({
                            isSuccess: false,
                            message: "Dữ liệu không tồn tại",
                        });
                    }
                    const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics ${search ? `WHERE name LIKE '%${search}%' OR address LIKE '%${search}%'` : ""}`);
                    const total = count[0].total;
                    const totalPages = Math.ceil(total / limit);
                    const data = rows.map((item) => {
                        return {
                            ...item,
                            firstname: manager[0].firstname,
                            lastname: manager[0].lastname,
                        };
                    });
                    return res.status(200).json({
                        data: data,
                        page: page,
                        isSuccess: true,
                        totalPages: totalPages,
                        message: "Tải dữ liệu thành công",
                    });
                }
                //get all clinics
                const [rows] = await db.query(`SELECT * FROM clinics`);
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
            } else {
                //get clinic by id
                const [rows] = await db.query(`
                    SELECT clinics.*, clinictypes.name as type FROM clinics
                    INNER JOIN clinictypes ON clinictypes.id = clinics.type
                    WHERE clinics.id = '${id}'
                    `);
                if (rows.length === 0) {
                    return res.status(404).json({
                        isSuccess: true,
                        data: [],
                        message: "Dữ liệu không tồn tại",
                    });
                }

                return res.status(200).json({
                    data: rows[0],
                    isSuccess: true,
                    message: "Tải dữ liệu thành công",
                });
            }
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
                const [count] = await db.query(`SELECT COUNT(*) as total FROM clinics ${search !== "all" ? `WHERE id = '${search}'` : ""}`);
                const total = count[0].total;
                const totalPages = Math.ceil(total / limit);

                if (rows.length === 0) {
                    return res.status(404).json({
                        isSuccess: true,
                        message: "Dữ liệu không tồn tại",
                        data: [],
                    });
                }

                return res.status(200).json({
                    data: rows,
                    page: page,
                    isSuccess: true,
                    totalPages: totalPages,
                    message: "Tải dữ liệu thành công",
                });
            }
            //get all clinics
            const [rows] = await db.query(`SELECT * FROM clinics WHERE type = ${id}`);
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

    async updateClinic(req, res) {
        try {
            const { id, name, address, phone, email, description, image, schedule, content, establish, firstname, lastname, type } = req.body;

            if (!id || !name || !address || !phone || !email || !firstname || !lastname) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Vui lòng nhập đầy đủ thông phòng khám",
                });
            }
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
                    ${type ? `type = '${type}',` : ""}
                    `.replace(/,\s*$/, "") + // Remove trailing comma
                    ` WHERE id = '${id}'`
            );
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật phòng khám thất bại",
                });
            }

            if (firstname && lastname) {
                const [rows2] = await db.query(
                    `UPDATE doctor SET 
                        ${firstname ? `firstname = '${firstname}',` : ""} 
                        ${lastname ? `lastname = '${lastname}',` : ""} 
                        `.replace(/,\s*$/, "") + // Remove trailing comma
                        ` WHERE clinicId = '${id}'`
                );
                if (rows2.affectedRows === 0) {
                    return res.status(400).json({
                        isSuccess: false,
                        message: "Cập nhật phòng khám thất bại",
                    });
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
            const [rows] = await db.query(`DELETE FROM clinics WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa phòng khám thất bại",
                });
            }
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES ('${uuidv4()}', 'DELETE', 'Delete clinic id ${id} with name ${name}', '${
                    req.user.id
                }', 'DELETE FROM clinics WHERE id = ${id}')`
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
            console.log(id, isPublic);

            const [rows] = await db.query(`UPDATE clinics SET isPublic = ${isPublic} WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Cập nhật phòng khám thất bại",
                });
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

            const [rows] = await db.query(`
                SELECT clinics.isPublic, clinics.id as clinicId , specialty.* FROM specialty 
                INNER JOIN clinics ON clinics.id = specialty.clinicId
                WHERE specialty.clinicId = '${clinicId}'
                ${search ? `AND specialty.name LIKE '%${search}%'` : ""}
                ${sort ? `ORDER BY ${sort + " " + (sort !== "createdAt" ? "ASC" : "DESC")}` : ""}
                ${limit ? `LIMIT ${limit} OFFSET ${offset}` : ""}
            `);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
            const [isPublic] = await db.query(`
                SELECT COUNT(*) as total FROM specialty
                INNER JOIN clinics ON clinics.id = specialty.clinicId
                WHERE specialty.isPublic = true AND specialty.clinicId = '${clinicId}'
                ${search ? `AND specialty.name LIKE '%${search}%'` : ""}
            `);

            const [isPrivate] = await db.query(`
                SELECT COUNT(*) as total FROM specialty
                INNER JOIN clinics ON clinics.id = specialty.clinicId
                WHERE specialty.isPublic = false AND specialty.clinicId = '${clinicId}'
                ${search ? `AND clinics.name LIKE '%${search}%'` : ""}
            `);
            return res.status(200).json({
                data: rows,
                isSuccess: true,
                public: isPublic[0].total,
                private: isPrivate[0].total,
                count: isPublic[0].total + isPrivate[0].total,
                page: page,
                totalPages: Math.ceil((isPublic[0].total + isPrivate[0].total) / limit),
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

            const [rows] = await db.query(`
                SELECT clinics.id as clinicId, clinics.name as clinicName, clinics.star, clinics.schedule, clinics.address, clinics.description , specialty.* FROM specialty 
                INNER JOIN clinics ON clinics.id = specialty.clinicId
                WHERE specialty.isPublic = true AND specialty.clinicId = '${clinicId}'
                ${search ? `AND specialty.name LIKE '%${search}%'` : ""}
                ${sort ? `ORDER BY ${sort + " " + (sort !== "createdAt" ? "ASC" : "DESC")}` : ""}
                ${limit ? `LIMIT ${limit} OFFSET ${offset}` : ""}
            `);
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
            const { name, clinicId, description, price, discount } = req.body;
            console.log(req.body);

            const id = uuidv4();
            const [rows] = await db.query(
                `INSERT INTO specialty (id, name, clinicId, description, price, discount) VALUES ('${id}', '${name}', '${clinicId}', '${description}', '${price}', '${discount}')`
            );
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
            const { id, name, description, price } = req.body;
            const [rows] = await db.query(
                `UPDATE specialty SET 
                    ${name ? `name = '${name}',` : ""} 
                    ${description ? `description = '${description}',` : ""} 
                    ${price ? `price = '${price}',` : "Đang cập nhật"} 
                    `.replace(/,\s*$/, "") + // Remove trailing comma
                    ` WHERE id = '${id}'`
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

    async deleteSpecialty(req, res) {
        try {
            const { id, name } = req.query;
            const [rows] = await db.query(`DELETE FROM specialty WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa chuyên khoa thất bại",
                });
            }
            console.log(`DELETE FROM specialty WHERE id = ${id}`);

            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES ('${uuidv4()}', 'DELETE', 'Delete specialty id ${id} with name ${name}', '${
                    req.user.id
                }', 'DELETE FROM specialty WHERE id = ${id}')`
            );
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
            const [rows] = await db.query(`UPDATE specialty SET isPublic = ${isPublic} WHERE id = '${id}'`);
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

    //CRUD medical package

    async readMedicalPackage(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;
            console.log(search);

            let offset = 0;
            if (limit && page) {
                offset = (page - 1) * limit;
            }
            const [rows] = await db.query(`
                SELECT clinics.id as clinicId, clinics.name as clinicName, clinics.star, clinics.schedule, clinics.address, clinics.description , examinationpackage.* FROM examinationpackage 
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                WHERE examinationpackage.clinicId = '${clinicId}'
                ${search ? `AND examinationpackage.name LIKE '%${search}%'` : ""}
                ${sort ? `ORDER BY ${sort + " " + (sort !== "createdAt" ? "ASC" : "DESC")}` : ""}
                ${limit ? `LIMIT ${limit} OFFSET ${offset}` : ""}
            `);
            if (rows.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Dữ liệu không tồn tại",
                });
            }
            const [isPublic] = await db.query(`
                SELECT COUNT(*) as total FROM examinationpackage
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                WHERE examinationpackage.isPublic = true AND examinationpackage.clinicId = '${clinicId}'
                ${search ? `AND clinics.name LIKE '%${search}%'` : ""}
            `);

            const [isPrivate] = await db.query(`
                SELECT COUNT(*) as total FROM examinationpackage
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                WHERE examinationpackage.isPublic = false AND examinationpackage.clinicId = '${clinicId}'
                ${search ? `AND clinics.name LIKE '%${search}%'` : ""}
            `);

            return res.status(200).json({
                data: rows,
                isSuccess: true,
                public: isPublic[0].total,
                private: isPrivate[0].total,
                count: isPublic[0].total + isPrivate[0].total,
                page: page,
                totalPages: Math.ceil((isPublic[0].total + isPrivate[0].total) / limit),
                message: "Tải dữ liệu thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }
    async createMedicalPackage(req, res) {
        try {
            const { name, clinicId, description, price, discount } = req.body;
            const id = uuidv4();
            const [rows] = await db.query(
                `INSERT INTO examinationpackage (id, name, clinicId, description, price, discount) VALUES ('${id}', '${name}', '${clinicId}', '${description}', '${price}', '${discount}')`
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
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }
    async updateMedicalPackage(req, res) {
        try {
            const { id, name, description, price, discount } = req.body;
            const [rows] = await db.query(
                `UPDATE examinationpackage SET 
                    ${name ? `name = '${name}',` : ""} 
                    ${description ? `description = '${description}',` : ""} 
                    ${price ? `price = '${price}',` : ""} 
                    ${discount ? `discount = '${discount}',` : ""} 
                    `.replace(/,\s*$/, "") + // Remove trailing comma
                    ` WHERE id = '${id}'`
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
                message: error,
            });
        }
    }
    async deleteMedicalPackage(req, res) {
        try {
            const { id, name } = req.query;
            const [rows] = await db.query(`DELETE FROM examinationpackage WHERE id = '${id}'`);
            if (rows.affectedRows === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Xóa gói khám thất bại",
                });
            }
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES ('${uuidv4()}', 'DELETE', 'Delete examinationpackage id ${id} with name ${name}', '${
                    req.user.id
                }', 'DELETE FROM examinationpackage WHERE id = ${id}')`
            );
            return res.status(200).json({
                isSuccess: true,
                message: "Xóa gói khám thành công",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                isSuccess: false,
                message: error,
            });
        }
    }
    async setPublicMedicalPackage(req, res) {
        try {
            const { id, isPublic } = req.body;
            const [rows] = await db.query(`UPDATE examinationpackage SET isPublic = ${isPublic} WHERE id = '${id}'`);
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
                message: error,
            });
        }
    }
    async readMedicalPackagePublic(req, res) {
        try {
            const { clinicId, sort, search, limit, page } = req.query;
            let offset = 0;
            if (limit && page) {
                offset = (page - 1) * limit;
            }
            const [rows] = await db.query(`
                SELECT clinics.id as clinicId, clinics.name as clinicName, clinics.star, clinics.schedule, clinics.address, clinics.description , examinationpackage.* FROM examinationpackage 
                INNER JOIN clinics ON clinics.id = examinationpackage.clinicId
                WHERE examinationpackage.isPublic = true AND examinationpackage.clinicId = '${clinicId}'
                ${search ? `AND examinationpackage.name LIKE '%${search}%'` : ""}
                ${sort ? `ORDER BY ${sort + " " + (sort !== "createdAt" ? "ASC" : "DESC")}` : ""}
                ${limit ? `LIMIT ${limit} OFFSET ${offset}` : ""}
            `);
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
                message: error,
            });
        }
    }
}
export default ClinicController;
