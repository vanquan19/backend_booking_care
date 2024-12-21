import db from "../config/db.js";
export default class HistoryBooking {
    constructor(id, clinicId, specialtyId, profileId, patientId, doctorId, packageId, time, date, month, year, status, note) {
        this.id = id;
        this.clinicId = clinicId;
        this.specialtyId = specialtyId;
        this.profileId = profileId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.packageId = packageId;
        this.time = time;
        this.date = date;
        this.month = month;
        this.year = year;
        this.status = status;
        this.note = note;
    }

    async createHistoryBooking() {
        const params = [
            this.id,
            this.clinicId,
            this.specialtyId || "",  // Default to empty string if specialtyId is not provided
            this.profileId,
            this.patientId,
            this.doctorId || "",      // Default to empty string if doctorId is not provided
            this.packageId || "",     // Default to empty string if packageId is not provided
            this.time,
            this.date,
            this.month,
            this.year
        ];
    
        try {
            const query = `INSERT INTO historybooking (id, clinicId, specialtyId, profileId, patientId, doctorId, packageId, time, date, month, year) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [rows] = await db.query(query, params);
            if (rows.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Tạo lịch sử đặt khám thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Tạo lịch sử đặt khám thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message || "Tạo lịch sử đặt khám thất bại",
            };
        }
    }
    

    async getHistoryBooking() {
        
        try {
            const query = `
                SELECT historybooking.*, 
                       patientprofile.fullname, patientprofile.birthday, patientprofile.career, 
                       patientprofile.commune, patientprofile.district, patientprofile.province, 
                       patientprofile.email, patientprofile.phone, patientprofile.nation, 
                       patientprofile.sex, patientprofile.identify, patientprofile.curentAddress,
                       specialty.id AS specialtyId, specialty.name AS specialtyName,
                       doctor.id AS doctorId, doctor.firstname AS doctorFirstname, doctor.lastname AS doctorLastname, doctor.price AS doctorPrice,
                       package.id AS packageId, package.name AS packageName, package.price AS packagePrice
                FROM historybooking
                INNER JOIN patient ON historybooking.patientId = patient.id
                INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
                LEFT JOIN specialty ON historybooking.specialtyId = specialty.id
                LEFT JOIN doctor ON historybooking.doctorId = doctor.id
                LEFT JOIN examinationpackage AS package ON historybooking.packageId = package.id
                WHERE historybooking.patientId = ? AND historybooking.status = ?
                ORDER BY historybooking.createdAt DESC
            `;
            const params = [this.patientId, this.status];
            const [rows] = await db.query(query, params);
    
            const datas = rows.map((data) => {
                if (data.specialtyId) {
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: {
                            id: data.specialtyId,
                            name: data.specialtyName
                        },
                        doctor: {
                            id: data.doctorId,
                            firstname: data.doctorFirstname,
                            lastname: data.doctorLastname,
                            price: data.doctorPrice
                        }
                    };
                } else if (data.packageId) {
                    return {
                        ...data,
                        type: "Đặt khám theo gói khám",
                        package: {
                            id: data.packageId,
                            name: data.packageName,
                            price: data.packagePrice
                        },
                        doctor: {
                            id: data.doctorId,
                            firstname: data.doctorFirstname,
                            lastname: data.doctorLastname
                        }
                    };
                } else {
                    return {
                        ...data
                    };
                }
            });
    
            return {
                isSuccess: true,
                message: "Lấy lịch sử đặt khám thành công",
                data: datas
            };
    
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message || "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    

    async getHistoryBookingByStatus() {
        try {
            const query = `
                SELECT historybooking.*, patientprofile.fullname, patientprofile.birthday, patientprofile.career, patientprofile.commune,
                    patientprofile.district, patientprofile.province, patientprofile.email, patientprofile.phone, patientprofile.nation,
                     patientprofile.sex, patientprofile.identify, patientprofile.curentAddress as address
                FROM historybooking
                INNER JOIN patient ON historybooking.patientId = patient.id
                INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
                WHERE historybooking.clinicId = ? AND historybooking.status = ?
                ORDER BY historybooking.createdAt DESC
                `;
            const params = [this.clinicId, this.status];
            const [rows] = await db.query(query , params);
            const datas = rows.map(async (data) => {
                if (data.specialtyId) {
                    const [specialty] = await db.query(`SELECT id, name FROM specialty WHERE id = '${data.specialtyId}'`);
                    const [doctor] = await db.query(`SELECT id, firstname, lastname, price FROM doctor WHERE id = '${data.doctorId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: specialty[0],
                        doctor: doctor[0],
                    };
                } else if (data.packageId) {
                    const [pakage] = await db.query(`SELECT id, name, price FROM examinationpackage WHERE id = '${data.packageId}'`);
                    const [doctor] = await db.query(`SELECT id, firstname, lastname FROM doctor WHERE id = '${data.doctorId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo gói khám",
                        package: pakage[0],
                        doctor: doctor[0],
                    };
                } else
                    return {
                        ...data,
                    };
            });
            return {
                isSuccess: true,
                data: await Promise.all(datas),
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    async getHistoryBookingByDate(listProfile) {
        try {
            // Construct query to fetch all history bookings in one go with JOINs
            
            const query = `
                SELECT historybooking.*, 
                       patientprofile.fullname, patientprofile.email, patientprofile.phone,
                       specialty.id AS specialtyId, specialty.name AS specialtyName,
                       doctor.id AS doctorId, doctor.firstname AS doctorFirstname, doctor.lastname AS doctorLastname, doctor.price AS doctorPrice,
                       package.id AS packageId, package.name AS packageName
                FROM historybooking
                INNER JOIN patient ON historybooking.patientId = patient.id
                INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
                LEFT JOIN specialty ON historybooking.specialtyId = specialty.id
                LEFT JOIN doctor ON historybooking.doctorId = doctor.id
                LEFT JOIN examinationpackage AS package ON historybooking.packageId = package.id
                WHERE historybooking.id IN (?) AND historybooking.status BETWEEN 2 AND 5
                ORDER BY STR_TO_DATE(SUBSTRING_INDEX(historybooking.time, ' - ', 1), '%H:%i') ASC
            `;
            
            // Execute query with parameterized listProfile
            const [rows] = await db.query(query, [listProfile]);
    
            // Process results
            const results = rows.map((row) => {
                if (row.specialtyId) {
                    return {
                        ...row,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: {
                            id: row.specialtyId,
                            name: row.specialtyName
                        },
                        doctor: {
                            id: row.doctorId,
                            firstname: row.doctorFirstname,
                            lastname: row.doctorLastname,
                            price: row.doctorPrice
                        }
                    };
                } else if (row.packageId) {
                    return {
                        ...row,
                        type: "Đặt khám theo gói khám",
                        package: {
                            id: row.packageId,
                            name: row.packageName
                        },
                        doctor: {
                            id: row.doctorId,
                            firstname: row.doctorFirstname,
                            lastname: row.doctorLastname
                        }
                    };
                } else {
                    return { ...row };
                }
            });
    
            return {
                isSuccess: true,
                data: results,
            };
    
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message || "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    

    async getAmountBookingByStatus() {
        const query = `
            SELECT status, COUNT(*) as amount
            FROM historybooking
            WHERE clinicId = ? 
            ${this.doctorId ? `AND doctorId = ?` : ""}
            GROUP BY status
        `;
    
        const params = [this.clinicId];
        if (this.doctorId) {
            params.push(this.doctorId);
        }
    
        try {
            const [rows] = await db.query(query, params);
    
            // Default status names mapping
            const statusNames = {
                1: "Chờ xác nhận",
                2: "Đã xác nhận",
                3: "Đang khám",
                4: "Đã khám",
                5: "Đã từ chối",
            };
    
            // Map query results to the status names
            const data = Object.keys(statusNames).map((status) => {
                const row = rows.find(r => r.status == status);
                return {
                    status: status,
                    name: statusNames[status],
                    amount: row ? row.amount : 0,  // Default to 0 if no record for that status
                };
            });
    
            return {
                isSuccess: true,
                data,
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    

    async getAmountHistoryBooking() {
        const query1 = `SELECT COUNT(*) as amount FROM historybooking WHERE patientId = ? AND status = ?`;
        const query2 = `SELECT COUNT(*) as amount FROM historybooking WHERE patientId = ? AND status = ?`;
        const query4 = `SELECT COUNT(*) as amount FROM historybooking WHERE patientId = ? AND status = ?`;
        const query5 = `SELECT COUNT(*) as amount FROM historybooking WHERE patientId = ? AND status = ?`;

        try {
            const [rows1] = await db.query(query1, [this.patientId, 1]);
            const [rows2] = await db.query(query2, [this.patientId, 2]);
            const [rows4] = await db.query(query4, [this.patientId, 4]);
            const [rows5] = await db.query(query5, [this.patientId, 0]);

            return {
                isSuccess: true,
                data: [
                    {
                        status: 1,
                        name: "Chờ xác nhận",
                        amount: rows1[0].amount,
                    },
                    {
                        status: 2,
                        name: "Đã xác nhận",
                        amount: rows2[0].amount,
                    },
                    {
                        status: 4,
                        name: "Đã khám",
                        amount: rows4[0].amount,
                    },
                    {
                        status: 0,
                        name: "Đã hủy",
                        amount: rows5[0].amount,
                    },
                ],
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    async getHistoryBookingSearch(search) {
        
        try {
            const query = `
                SELECT historybooking.*, 
                       patientprofile.fullname, patientprofile.birthday, patientprofile.career, 
                       patientprofile.commune, patientprofile.district, patientprofile.province, 
                       patientprofile.email, patientprofile.phone, patientprofile.nation, 
                       patientprofile.sex, patientprofile.identify, patientprofile.curentAddress as address,
                       specialty.name as specialty_name, specialty.price as specialty_price, 
                       examinationpackage.name as package_name, examinationpackage.price as package_price,
                       doctor.firstname as doctor_firstname, doctor.lastname as doctor_lastname, doctor.price as doctor_price
                FROM historybooking
                INNER JOIN patient ON historybooking.patientId = patient.id
                INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
                LEFT JOIN specialty ON historybooking.specialtyId = specialty.id
                LEFT JOIN examinationpackage ON historybooking.packageId = examinationpackage.id
                LEFT JOIN doctor ON historybooking.doctorId = doctor.id
                WHERE historybooking.clinicId = ? 
                  AND patientprofile.fullname LIKE ? 
                ORDER BY historybooking.createdAt DESC
                LIMIT 5
            `;
            const [rows] = await db.query(query, [this.clinicId, `%${search}%`]);
    
            // Map data with the additional fields from the joined tables
            const data = rows.map((data) => {
                if (data.specialty_name) {
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: {
                            name: data.specialty_name,
                            price: data.specialty_price,
                        },
                    };
                } else if (data.package_name) {
                    return {
                        ...data,
                        type: "Đặt khám theo gói",
                        package: {
                            name: data.package_name,
                            price: data.package_price,
                        },
                    };
                } else {
                    return {
                        ...data,
                    };
                }
            });
    
            return {
                isSuccess: true,
                message: "Lấy lịch sử đặt khám thành công",
                data,
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    

    async getHistoryBookingById() {
        const query = `SELECT * FROM historybooking WHERE id = ?`;
        try {
            const [rows] = await db.query(query, [this.id]);
            
            if (rows.length === 0) {
                return {
                    isSuccess: false,
                    message: "Không tìm thấy lịch sử đặt khám.",
                };
            }
    
            return {
                isSuccess: true,
                data: rows[0], // Return the first result as it's expected to be unique for an ID
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }
    

    async updateStatusHistoryBooking() {
        const query = `UPDATE historybooking SET status = ? WHERE id = ?`;
        try {
            const [rows] = await db.query(query, [this.status, this.id]);
            if (rows.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Cập nhật trạng thái lịch sử đặt khám thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Cập nhật trạng thái lịch sử đặt khám thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Cập nhật trạng thái lịch sử đặt khám thất bại",
            };
        }
    }
    //get history booking by doctor
    async getHistoryByDoctor() {
        const query = `
        SELECT historybooking.*, patientprofile.fullname, patientprofile.birthday, patientprofile.career, patientprofile.commune,
            patientprofile.district, patientprofile.province, patientprofile.email, patientprofile.phone, patientprofile.nation,
             patientprofile.sex, patientprofile.identify, patientprofile.curentAddress as address
        FROM historybooking
        INNER JOIN patient ON historybooking.patientId = patient.id
        INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
        WHERE historybooking.doctorId = ? AND historybooking.status = ?
        ORDER BY historybooking.createdAt DESC
        `;
        try {
            const [rows] = await db.query(query, [this.doctorId, this.status]);

            const datas = rows.map(async (data) => {
                if (data.specialtyId) {
                    const [specialty] = await db.query(`SELECT id, name FROM specialty WHERE id = ?`, [data.specialtyId]);
                    const [doctor] = await db.query(`SELECT id, firstname, lastname, price FROM doctor WHERE id = ?`, [data.doctorId]);
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: specialty[0],
                        doctor: doctor[0],
                    };
                } else if (data.packageId) {
                    const [pakage] = await db.query(`SELECT id, name, price FROM examinationpackage WHERE id = ?`, [data.packageId]);
                    const [doctor] = await db.query(`SELECT id, firstname, lastname FROM doctor WHERE id = ?`, [data.doctorId]);
                    return {
                        ...data,
                        type: "Đặt khám theo gói khám",
                        package: pakage[0],
                        doctor: doctor[0],
                    };
                } else
                    return {
                        ...data,
                    };
            });
            return {
                isSuccess: true,
                data: await Promise.all(datas),
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }

    async updateNote() {
        try {
            const query = `UPDATE historybooking SET note = ? WHERE id = ?`;
            const [rows] = await db.query(query, [this.note, this.id]);
            if (rows.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Cập nhật ghi chú thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Cập nhật ghi chú thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    // getter and setter
    getID() {
        return this.id;
    }
    getClinicId() {
        return this.clinicId;
    }
    getSpecialtyId() {
        return this.specialtyId;
    }
    getProfileId() {
        return this.profileId;
    }
    getPatientId() {
        return this.patientId;
    }
    getDoctorId() {
        return this.doctorId;
    }
    getPackageId() {
        return this.packageId;
    }
    getTime() {
        return this.time;
    }
    getDate() {
        return this.date;
    }
    getMonth() {
        return this.month;
    }
    getYear() {
        return this.year;
    }
    getStatus() {
        return this.status;
    }
    getNote() {
        return this.note;
    }

    setID(id) {
        this.id = id;
    }
    setClinicId(clinicId) {
        this.clinicId = clinicId;
    }
    setSpecialtyId(specialtyId) {
        this.specialtyId = specialtyId;
    }
    setProfileId(profileId) {
        this.profileId = profileId;
    }
    setPatientId(patientId) {
        this.patientId = patientId;
    }
    setDoctorId(doctorId) {
        this.doctorId = doctorId;
    }
    setPackageId(packageId) {
        this.packageId = packageId;
    }
    setTime(time) {
        this.time = time;
    }
    setDate(date) {
        this.date = date;
    }
    setMonth(month) {
        this.month = month;
    }
    setYear(year) {
        this.year = year;
    }
    setStatus(status) {
        this.status = status;
    }
    setNote(note) {
        this.note = note;
    }
}
