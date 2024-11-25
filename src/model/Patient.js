import db from "../config/db.js";
class Patient {
    constructor(id, name, phone, email, address) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    getID() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getPhone() {
        return this.phone;
    }
    getEmail() {
        return this.email;
    }
    getAddress() {
        return this.address;
    }

    setID(id) {
        this.id = id;
    }
    setName(name) {
        this.name = name;
    }
    setPhone(phone) {
        this.phone = phone;
    }
    setEmail(email) {
        this.email = email;
    }
    setAddress(address) {
        this.address = address;
    }

    // check phone exist in database
    async checkPhoneExist() {
        const query = `SELECT * FROM patient WHERE phone = '${this.phone}'`;
        const [rows] = await db.query(query);
        if (rows.length > 0) {
            return {
                isSuccess: true,
                data: rows[0],
                message: "Số điện thoại đã tồn tại",
            };
        }
        return {
            isSuccess: false,
            data: null,
            message: "Số điện thoại chưa tồn tại",
        };
    }

    // create patient
    async createPatient() {
        const query = `INSERT INTO patient (id, name, phone, email, address) VALUES ('${this.id}', '${this.name}', '${this.phone}', '${this.email}', '${this.address}')`;
        const [rows] = await db.query(query);
        if (rows.affectedRows > 0) {
            return {
                isSuccess: true,
                message: "Tạo tài khoản thành công",
            };
        }
        return {
            isSuccess: false,
            message: "Tạo tài khoản thất bại",
        };
    }
}
export default Patient;
