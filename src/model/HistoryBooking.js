import db from "../config/db.js";
export default class HistoryBooking {
    constructor(id, clinicId, specialtyId, profileId, patientId, doctorId, pakageId, time, date, month, year, status) {
        this.id = id;
        this.clinicId = clinicId;
        this.specialtyId = specialtyId;
        this.profileId = profileId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.pakageId = pakageId;
        this.time = time;
        this.date = date;
        this.month = month;
        this.year = year;
        this.status = status;
    }

    async createHistoryBooking() {
        const query = `INSERT INTO historybooking (id, clinicId , specialtyId , profileId , patientId , doctorId , pakageId , time, date, month, year) VALUES
         ('${this.id}', '${this.clinicId}', '${this.specialtyId || ""}', '${this.profileId}', '${this.patientId}', '${this.doctorId || ""}', '${this.pakageId || ""}', '${this.time}', '${
            this.date
        }', '${this.month}', '${this.year}')`;

        try {
            const [rows] = await db.query(query);
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
                message: "Tạo lịch sử đặt khám thất bại",
            };
        }
    }

    async getHistoryBooking() {
        const query = `SELECT * FROM historybooking WHERE clinicId = '${this.clinicId}'`;
        try {
            const [rows] = await db.query(query);
            return {
                isSuccess: true,
                data: rows,
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy lịch sử đặt khám thất bại",
            };
        }
    }

    async getHistoryBookingByStatus() {
        const query = `
            SELECT historybooking.*, patientprofile.fullname, patientprofile.birthday, patientprofile.career, patientprofile.commune,
                patientprofile.district, patientprofile.province, patientprofile.email, patientprofile.phone, patientprofile.nation,
                 patientprofile.sex, patientprofile.identify, patientprofile.curentAddress as address
            FROM historybooking
            INNER JOIN patient ON historybooking.patientId = patient.id
            INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
            WHERE historybooking.clinicId = '${this.clinicId}' AND historybooking.status = '${this.status}'
            ORDER BY historybooking.createdAt DESC
            `;
        try {
            const [rows] = await db.query(query);
            const datas = rows.map(async (data) => {
                if (data.specialtyId) {
                    const [specialty] = await db.query(`SELECT id, name, price FROM specialty WHERE id = '${data.specialtyId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: specialty[0],
                    };
                } else if (data.pakageId) {
                    const [pakage] = await db.query(`SELECT id, name, price FROM examinationpackage WHERE id = '${data.pakageId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo gói",
                        pakage: pakage[0],
                    };
                } else if (data.doctorId) {
                    const [doctor] = await db.query(`SELECT id, firstname, lastname, price FROM doctor WHERE id = '${data.doctorId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo bác sĩ",
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

    async getAmountBookingByStatus() {
        const query1 = `SELECT COUNT(*) as amount FROM historybooking WHERE clinicId = '${this.clinicId}' AND status = 1`;
        const query2 = `SELECT COUNT(*) as amount FROM historybooking WHERE clinicId = '${this.clinicId}' AND status = 2`;
        const query3 = `SELECT COUNT(*) as amount FROM historybooking WHERE clinicId = '${this.clinicId}' AND status = 3`;
        const query4 = `SELECT COUNT(*) as amount FROM historybooking WHERE clinicId = '${this.clinicId}' AND status = 4`;
        const query5 = `SELECT COUNT(*) as amount FROM historybooking WHERE clinicId = '${this.clinicId}' AND status = 5`;

        try {
            const [rows1] = await db.query(query1);
            const [rows2] = await db.query(query2);
            const [rows3] = await db.query(query3);
            const [rows4] = await db.query(query4);
            const [rows5] = await db.query(query5);

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
                        status: 3,
                        name: "Đang khám",
                        amount: rows3[0].amount,
                    },
                    {
                        status: 4,
                        name: "Đã khám",
                        amount: rows4[0].amount,
                    },
                    {
                        status: 5,
                        name: "Đã từ chối",
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
        const query = `
        SELECT historybooking.*, patientprofile.fullname, patientprofile.birthday, patientprofile.career, patientprofile.commune,
            patientprofile.district, patientprofile.province, patientprofile.email, patientprofile.phone, patientprofile.nation,
             patientprofile.sex, patientprofile.identify, patientprofile.curentAddress as address
        FROM historybooking
        INNER JOIN patient ON historybooking.patientId = patient.id
        INNER JOIN patientprofile ON historybooking.profileId = patientprofile.id
        WHERE historybooking.clinicId = '${this.clinicId}'  AND patientprofile.fullname LIKE '%${search}%'
        ORDER BY historybooking.createdAt DESC
        LIMIT 5
        `;
        try {
            const [rows] = await db.query(query);
            const datas = rows.map(async (data) => {
                if (data.specialtyId) {
                    const [specialty] = await db.query(`SELECT id, name, price FROM specialty WHERE id = '${data.specialtyId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo chuyên khoa",
                        specialty: specialty[0],
                    };
                } else if (data.pakageId) {
                    const [pakage] = await db.query(`SELECT id, name, price FROM examinationpackage WHERE id = '${data.pakageId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo gói",
                        specialty: pakage[0],
                    };
                } else if (data.doctorId) {
                    const [doctor] = await db.query(`SELECT id, firstname, lastname, price FROM doctor WHERE id = '${data.doctorId}'`);
                    return {
                        ...data,
                        type: "Đặt khám theo bác sĩ",
                        doctor: doctor[0],
                    };
                } else
                    return {
                        ...data,
                    };
            });
            return {
                isSuccess: true,
                message: "Lấy lịch sử đặt khám thành công",
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

    async getHistoryBookingById() {
        const query = `SELECT * FROM historybooking WHERE id = '${this.id}'`;
        try {
            const [rows] = await db.query(query);
            return {
                isSuccess: true,
                data: rows,
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
        const query = `UPDATE historybooking SET status = '${this.status}' WHERE id = '${this.id}'`;
        try {
            const [rows] = await db.query(query);
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
    getPakageId() {
        return this.pakageId;
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
    setPakageId(pakageId) {
        this.pakageId = pakageId;
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
}
