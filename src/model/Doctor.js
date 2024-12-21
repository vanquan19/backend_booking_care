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
            // Start building the base SQL query
            let sql = `
                SELECT doctor.id, doctor.firstname, doctor.lastname, doctor.position, doctor.specialize, doctor.price, 
                       clinics.name AS clinicName, clinics.address AS clinicAddress, users.phone, users.email, 
                       users.image, doctor.isPublic AS isPublic, specialty.name AS specialtyName
                FROM doctor
                INNER JOIN clinics ON doctor.clinicID = clinics.id
                INNER JOIN users ON doctor.userID = users.id
                LEFT JOIN specialty ON doctor.specialize = specialty.id
                WHERE 1=1
            `;
    
            // Add conditions dynamically
            const queryParams = [];
            
            if (clinicId) {
                sql += ` AND clinics.id = ?`;
                queryParams.push(clinicId);
            }
    
            if (search) {
                sql += ` AND (doctor.firstname LIKE ? OR doctor.lastname LIKE ?)`;
                queryParams.push(`%${search}%`, `%${search}%`);
            }
    
            // Sorting logic
            if (sort) {
                const sortOptions = {
                    "price-asc": "doctor.price ASC",
                    "price-desc": "doctor.price DESC",
                    "name-asc": "doctor.firstname ASC , doctor.lastname ASC",
                    "name-desc": "doctor.firstname DESC , doctor.lastname DESC",
                    "position-asc": "doctor.position ASC",
                    "position-desc": "doctor.position DESC",
                    "specialize-asc": "doctor.specialize ASC",
                    "specialize-desc": "doctor.specialize DESC",
                    "clinic-asc": "clinics.name ASC",
                    "clinic-desc": "clinics.name DESC",
                    "createdAt-asc": "doctor.createdAt ASC",
                    "createdAt-desc": "doctor.createdAt DESC",
                };
    
                sql += ` ORDER BY ${sortOptions[sort] || "doctor.id DESC"}`;
            }
    
            // Pagination logic
            if (limit && page) {
                const offset = (page - 1) * parseInt(limit);
                sql += ` LIMIT ? OFFSET ?`;
                queryParams.push(+limit, offset);
            }
    
            // Execute the query with parameters
            const [rows] = await db.query(sql, queryParams);
    
            if (rows.length < 1) {
                return {
                    isSuccess: true,
                    message: "Không có bác sĩ nào!",
                };
            }
    
            // Count public and private doctors
            const [iPublicDoctor] = await db.query("SELECT COUNT(*) AS total FROM doctor WHERE isPublic = 1 AND clinicId = ?", [clinicId]);
            const [isPrivateDoctor] = await db.query("SELECT COUNT(*) AS total FROM doctor WHERE isPublic = 0 AND clinicId = ?", [clinicId]);
    
            return {
                isSuccess: true,
                data: rows,
                public: iPublicDoctor[0].total,
                private: isPrivateDoctor[0].total,
                count: iPublicDoctor[0].total + isPrivateDoctor[0].total,
                message: "Lấy danh sách bác sĩ thành công!",
            };
        } catch (error) {
            console.error("Error in getAllDoctor:", error); // Enhanced error logging
            return {
                isSuccess: false,
                message: error.message || "An error occurred while fetching doctors.",
            };
        }
    }
    

    async getAllPublicDoctor(sort, search, page, limit, clinicId, specialtyId) {
        try {
            let sql = `
                SELECT doctor.id, doctor.firstname, doctor.lastname, doctor.position, doctor.specialize, doctor.price, 
                       clinics.name AS clinicName, clinics.address AS clinicAddress, users.phone, users.email, 
                       users.image, doctor.isPublic AS isPublic, specialty.name AS specialtyName
                FROM doctor
                INNER JOIN clinics ON doctor.clinicID = clinics.id
                INNER JOIN users ON doctor.userID = users.id
                LEFT JOIN specialty ON doctor.specialize = specialty.id
                WHERE doctor.isPublic = 1
            `;
    
            // Initialize query parameters array
            const queryParams = [];
    
            // Add conditions dynamically
            if (clinicId) {
                sql += ` AND clinics.id = ?`;
                queryParams.push(clinicId);
            }
    
            if (specialtyId) {
                sql += ` AND doctor.specialize = ?`;
                queryParams.push(specialtyId);
            }
    
            if (search) {
                sql += ` AND (doctor.firstname LIKE ? OR doctor.lastname LIKE ?)`;
                queryParams.push(`%${search}%`, `%${search}%`);
            }
    
            // Sorting logic
            if (sort) {
                const sortOptions = {
                    "price-asc": "doctor.price ASC",
                    "price-desc": "doctor.price DESC",
                    "name-asc": "doctor.firstname ASC , doctor.lastname ASC",
                    "name-desc": "doctor.firstname DESC , doctor.lastname DESC",
                    "position-asc": "doctor.position ASC",
                    "position-desc": "doctor.position DESC",
                    "specialize-asc": "doctor.specialize ASC",
                    "specialize-desc": "doctor.specialize DESC",
                    "clinic-asc": "clinics.name ASC",
                    "clinic-desc": "clinics.name DESC",
                    "createdAt-asc": "doctor.createdAt ASC",
                    "createdAt-desc": "doctor.createdAt DESC",
                };
    
                sql += ` ORDER BY ${sortOptions[sort] || "doctor.id DESC"}`;
            }
    
            // Pagination logic
            if (limit && page) {
                const offset = (page - 1) * parseInt(limit);
                sql += ` LIMIT ? OFFSET ?`;
                queryParams.push(+limit, offset);
            }
    
            // Execute the query with parameters
            const [rows] = await db.query(sql, queryParams);
    
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
            console.error("Error in getAllPublicDoctor:", error); // Enhanced error logging
            return {
                isSuccess: false,
                message: error.message || "An error occurred while fetching doctors.",
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
    
            // Use parameterized queries to prevent SQL injection
            const sql = `
                INSERT INTO doctor (id, firstname, lastname, position, specialize, clinicId, price, userId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
    
            const doctorId = this.getId();
            const firstname = this.getFirstname();
            const lastname = this.getLastname();
            const position = this.getPosition();
            const specialize = this.getSpecialize();
            const clinicId = this.getClinicId();
            const price = this.getPrice();
            const userId = result.userId;
    
            // Use parameterized query with queryParams to avoid direct string interpolation
            const queryParams = [doctorId, firstname, lastname, position, specialize, clinicId, price, userId];
    
            // Execute the query
            const response = await db.query(sql, queryParams);
    
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
            console.error("Error in createDoctor:", error); // Enhanced error logging
            return {
                isSuccess: false,
                message: error.message || "An error occurred while creating the doctor.",
            };
        }
    }
    
    async setPublic(isPublic, doctorId) {
        try {
            const sql = `UPDATE doctor SET isPublic = ? WHERE id = ?`;
            const response = await db.query(sql, [isPublic, doctorId]);

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
            // Check if phone or email needs updating
            if (this.getPhone() || this.getEmail()) {
                // Query to get userId from doctor record
                const [userResponse] = await db.query("SELECT userID FROM doctor WHERE id = ?", [this.getId()]);
    
                // If doctor doesn't exist, return an error
                if (userResponse.length < 1) {
                    return {
                        isSuccess: false,
                        message: "Bác sĩ không tồn tại!",
                    };
                }
    
                const userId = userResponse[0].userID;
                this.setUserId(userId); // Set the userId for updating the user
                console.log(this);
                
                // Call the updateUser function (ensure this is returning a result to handle it)
                const updateUserResult = await this.updateUser();
                if (!updateUserResult.isSuccess) {
                    return updateUserResult; // Return if updateUser fails
                }
            }
    
            // Construct the update SQL query for doctor
            let sql = `UPDATE doctor SET 
                ${this.firstname ? `firstname = ?,` : ""}
                ${this.lastname ? `lastname = ?,` : ""}
                ${this.position ? `position = ?,` : ""}
                ${this.specialize ? `specialize = ?,` : ""}
                ${this.price ? `price = ?,` : ""}
                ${this.clinicId ? `clinicId = ?,` : ""}
                WHERE id = ?`;
    
            // Clean up the query (remove trailing comma before WHERE)
            sql = sql.replace(/,\s*WHERE/, " WHERE");
    
            // Parameters for query
            const params = [
                this.firstname, this.lastname, this.position, 
                this.specialize, this.price, this.clinicId, this.getId()
            ].filter(val => val !== undefined); // Remove undefined values from the parameters array
    
            // Execute the query with parameters
            const [response] = await db.query(sql, params);

            // Check if any rows were affected
            if (response.affectedRows < 1) {
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
                message: error.message || "An error occurred while updating the doctor.",
            };
        }
    }
    

    async deleteDoctor(userDelete) {
        try {
            // Parameterized query for deleting the doctor
            const sql = `DELETE FROM doctor WHERE id = ?`;
            const [response] = await db.query(sql, [this.getId()]);
    
            if (response.affectedRows < 1) {
                return {
                    isSuccess: false,
                    message: "Xóa bác sĩ không thành công!",
                };
            }
    
            // Create action history record for deletion
            const actionHistorySql = `INSERT INTO actionhistory (id, action, name, createdBy, query) 
                                      VALUES (?, 'DELETE', ?, ?, ?)`;
            const actionHistoryParams = [
                uuidv4(),
                `Delete doctor id ${this.getId()} with name ${this.getFirstname()} ${this.getLastname()}`,
                userDelete,
                `DELETE FROM doctor WHERE id = ${this.getId()}`
            ];
    
            await db.query(actionHistorySql, actionHistoryParams);
    
            return {
                isSuccess: true,
                message: "Xóa bác sĩ thành công!",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message || "An error occurred while deleting the doctor.",
            };
        }
    }
    
}

export default Doctor;
