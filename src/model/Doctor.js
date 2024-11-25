import db from "../config/db.js";
import User from "./User.js";
import { v4 as uuidv4 } from "uuid";
class Doctor extends User {
    constructor(userId, username, password, role, phone, email, image, token, id, firstname, lastname, position, specialize, price, clinicId) {
        super(userId, username, password, role, phone, email, image, token);
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.position = position;
        this.specialize = specialize;
        this.price = price;
        this.clinicId = clinicId;
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }

    getFirstname() {
        return this.firstname;
    }
    getLastname() {
        return this.lastname;
    }
    getPosition() {
        return this.position;
    }
    getSpecialize() {
        return this.specialize;
    }
    getPrice() {
        return this.price;
    }

    getClinicId() {
        return this.clinicId;
    }
    getUserId() {
        return this.userId;
    }
    setFirstname(firstname) {
        this.firstname = firstname;
    }
    setLastname(lastname) {
        this.lastname = lastname;
    }
    setPosition(position) {
        this.position = position;
    }
    setSpecialize(specialize) {
        this.specialize = specialize;
    }
    setPrice(price) {
        this.price = price;
    }
    setClinicId(clinicId) {
        this.clinicId = clinicId;
    }

    async getAllDoctor(sort, search, page, limit, clinicId) {
        try {
            let sql = `
            SELECT doctor.id, doctor.firstname, doctor.lastname, doctor.position, doctor.specialize, doctor.price, clinics.name as clinicName, clinics.address as clinicAddress, users.phone, users.email, users.image, doctor.isPublic as isPublic, specialty.name as specialtyName
            FROM doctor
            INNER JOIN clinics ON doctor.clinicID = clinics.id
            INNER JOIN users ON doctor.userID = users.id
            LEFT JOIN specialty ON doctor.specialize = specialty.id
            WHERE 1=1  

            `;
            if (clinicId) {
                sql += ` AND clinics.id = '${clinicId}'`;
            }
            if (search) {
                sql += `AND (doctor.firstname LIKE '%${search}%' OR doctor.lastname LIKE '%${search}%')`;
            }
            if (sort) {
                switch (sort) {
                    case "price-asc":
                        sort = "doctor.price ASC";
                        break;
                    case "price-desc":
                        sort = "doctor.price DESC";
                        break;
                    case "name-asc":
                        sort = "doctor.firstname ASC , doctor.lastname ASC";
                        break;
                    case "name-desc":
                        sort = "doctor.firstname DESC , doctor.lastname DESC";
                        break;
                    case "position-asc":
                        sort = "doctor.position ASC";
                        break;
                    case "position-desc":
                        sort = "doctor.position DESC";
                        break;
                    case "specialize-asc":
                        sort = "doctor.specialize ASC";
                        break;
                    case "specialize-desc":
                        sort = "doctor.specialize DESC";
                        break;
                    case "clinic-asc":
                        sort = "clinics.name ASC";
                        break;
                    case "clinic-desc":
                        sort = "clinics.name DESC";
                        break;
                    case "createdAt-asc":
                        sort = "doctor.createdAt ASC";
                        break;
                    case "createdAt-desc":
                        sort = "doctor.createdAt DESC";
                        break;

                    default:
                        sort = "doctor.id DESC";
                        break;
                }
                sql += ` ORDER BY ${sort}`;
            }
            if (limit && page) {
                const offset = (page - 1) * limit;
                sql += ` LIMIT ${limit} OFFSET ${offset}`;
            }
            const [rows] = await db.query(sql);
            if (rows.length < 1) {
                return {
                    isSuccess: true,
                    message: "Không có bác sĩ nào!",
                };
            }
            const [iPublicDoctor] = await db.query("SELECT COUNT(*) as total FROM doctor WHERE isPublic = 1 AND clinicId = ?", [clinicId]);
            const [isPrivateDoctor] = await db.query("SELECT COUNT(*) as total FROM doctor WHERE isPublic = 0 AND clinicId = ?", [clinicId]);
            return {
                isSuccess: true,
                data: rows,
                public: iPublicDoctor[0].total,
                private: isPrivateDoctor[0].total,
                count: iPublicDoctor[0].total + isPrivateDoctor[0].total,
                message: "Lấy danh sách bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);

            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async getAllPublicDoctor(sort, search, page, limit, clinicId) {
        try {
            let sql = `
            SELECT doctor.id, doctor.firstname, doctor.lastname, doctor.position, doctor.specialize, doctor.price, clinics.name as clinicName, clinics.address as clinicAddress, users.phone, users.email, users.image, doctor.isPublic as isPublic, specialty.name as specialtyName
            FROM doctor
            INNER JOIN clinics ON doctor.clinicID = clinics.id
            INNER JOIN users ON doctor.userID = users.id
            LEFT JOIN specialty ON doctor.specialize = specialty.id
            WHERE doctor.isPublic = 1  

            `;
            if (clinicId) {
                sql += ` AND clinics.id = '${clinicId}'`;
            }
            if (search) {
                sql += `AND (doctor.firstname LIKE '%${search}%' OR doctor.lastname LIKE '%${search}%')`;
            }
            if (sort) {
                switch (sort) {
                    case "price-asc":
                        sort = "doctor.price ASC";
                        break;
                    case "price-desc":
                        sort = "doctor.price DESC";
                        break;
                    case "name-asc":
                        sort = "doctor.firstname ASC , doctor.lastname ASC";
                        break;
                    case "name-desc":
                        sort = "doctor.firstname DESC , doctor.lastname DESC";
                        break;
                    case "position-asc":
                        sort = "doctor.position ASC";
                        break;
                    case "position-desc":
                        sort = "doctor.position DESC";
                        break;
                    case "specialize-asc":
                        sort = "doctor.specialize ASC";
                        break;
                    case "specialize-desc":
                        sort = "doctor.specialize DESC";
                        break;
                    case "clinic-asc":
                        sort = "clinics.name ASC";
                        break;
                    case "clinic-desc":
                        sort = "clinics.name DESC";
                        break;
                    case "createdAt-asc":
                        sort = "doctor.createdAt ASC";
                        break;
                    case "createdAt-desc":
                        sort = "doctor.createdAt DESC";
                        break;

                    default:
                        sort = "doctor.id DESC";
                        break;
                }
                sql += ` ORDER BY ${sort}`;
            }
            if (limit && page) {
                const offset = (page - 1) * limit;
                sql += ` LIMIT ${limit} OFFSET ${offset}`;
            }
            const [rows] = await db.query(sql);
            if (rows.length < 1) {
                return {
                    isSuccess: true,
                    message: "Không có bác sĩ nào!",
                };
            }
            return {
                isSuccess: true,
                data: rows,
                message: "Lấy danh sách bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async getDoctorById(id) {
        try {
            const [rows] = await db.query("SELECT * FROM doctor WHERE id = ?", [id]);
            if (response[0].length < 1) {
                return {
                    isSuccess: true,
                    message: "Không có bác sĩ nào!",
                };
            }
            return {
                isSuccess: true,
                data: rows,
                message: "Lấy bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async createDoctor() {
        try {
            const result = await this.createUser();
            if (!result.isSuccess) {
                return {
                    isSuccess: false,
                    message: result.message,
                };
            }

            const sql = `INSERT INTO doctor (id, firstname, lastname, position, specialize, clinicId, price, userId) VALUES ('${this.getId()}', '${this.getFirstname()}', '${this.getLastname()}', '${this.getPosition()}', '${this.getSpecialize()}', '${this.getClinicId()}', ${this.getPrice()}, '${
                result.userId
            }')`;
            const response = await db.query(sql);
            if (response[0].affectedRows < 1) {
                return {
                    isSuccess: false,
                    message: "Tạo bác sĩ không thành công!",
                };
            }
            return {
                isSuccess: true,
                message: "Tạo bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async setPublic(isPublic, doctorId) {
        try {
            const sql = `UPDATE doctor SET isPublic = ${isPublic} WHERE id = '${doctorId}'`;
            const response = await db.query(sql);
            console.log(response);

            if (response[0].affectedRows < 1) {
                return {
                    isSuccess: false,
                    message: "Cập nhật không thành công!",
                };
            }
            return {
                isSuccess: true,
                message: "Cập nhật thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async updateDoctor() {
        try {
            if (this.getPhone() || this.getEmail()) {
                //update user
                const user = db.query("SELECT userID FROM doctor WHERE id = ?", [this.getId()]);
                user.then((response) => {
                    if (response[0].length < 1) {
                        return {
                            isSuccess: false,
                            message: "Bác sĩ không tồn tại!",
                        };
                    }
                    const userId = response[0][0].userID;
                    this.setUserId(userId);
                    console.log(this);
                    this.updateUser();
                });
            }
            let sql = `UPDATE doctor SET 
                ${this.firstname ? `firstname = '${this.firstname}',` : ""}
                ${this.lastname ? `lastname = '${this.lastname}',` : ""}
                ${this.position ? `position = '${this.position}',` : ""}
                ${this.specialize ? `specialize = '${this.specialize}',` : ""}
                ${this.price ? `price = ${this.price},` : ""}
                ${this.clinicId ? `clinicId = ${this.clinicId},` : ""}
                WHERE id = '${this.getId()}'`;
            sql = sql.replace(/,\s*WHERE/, " WHERE");
            const response = await db.query(sql);
            console.log(response);

            if (response[0].affectedRows < 1) {
                return {
                    isSuccess: false,
                    message: "Cập nhật bác sĩ không thành công!",
                };
            }
            return {
                isSuccess: true,
                message: "Cập nhật bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async deleteDoctor(userDelete) {
        try {
            const sql = `DELETE FROM doctor WHERE id = '${this.getId()}'`;
            const response = await db.query(sql);

            if (response[0].affectedRows < 1) {
                return {
                    isSuccess: false,
                    message: "Xóa bác sĩ không thành công!",
                };
            }
            await db.query(
                `INSERT INTO actionhistory (id, action, name, createdBy, query) VALUES ('${uuidv4()}', 'DELETE', 'Delete doctor id ${this.getId()} with name ${
                    this.getFirstname + " " + this.getLastname
                }', '${userDelete}', 'DELETE FROM doctor WHERE id = ${this.getId()}')`
            );
            return {
                isSuccess: true,
                message: "Xóa bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
}

export default Doctor;
