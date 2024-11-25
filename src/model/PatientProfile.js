import db from "../config/db.js";
export class PatientProfile {
    constructor(id, name, phone, email, address, province, district, ward, birthday, sex, job, ethnic, identity, userId) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.province = province;
        this.district = district;
        this.ward = ward;
        this.birthday = birthday;
        this.sex = sex;
        this.job = job;
        this.ethnic = ethnic;
        this.identity = identity;
        this.userId = userId;
    }

    //create profile
    async createPatientProfile() {
        const query = `INSERT INTO patientprofile (id, fullname, phone, email, province, district, commune, birthday, sex, career, nation, identify, curentAddress, userID) VALUES
         ('${this.id}', '${this.name}', '${this.phone}', '${this.email}', '${this.province}', '${this.district}', '${this.ward}', '${this.birthday}', '${this.sex}', '${this.job}', '${this.ethnic}', '${this.identity}', '${this.address}', '${this.userId}')`;

        try {
            const [rows] = await db.query(query);
            if (rows.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Tạo hồ sơ thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Tạo hồ sơ thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Tạo hồ sơ thất bại",
            };
        }
    }

    //get profile
    async getPatientProfile(userId) {
        const query = `SELECT * FROM patientprofile WHERE userID = '${userId}'`;
        try {
            const [rows] = await db.query(query);
            console.log(rows);

            if (rows.length > 0) {
                return {
                    isSuccess: true,
                    data: rows,
                };
            }
            return {
                isSuccess: true,
                data: [],
                message: "Không tìm thấy hồ sơ",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: "Lấy hồ sơ thất bại",
            };
        }
    }

    //getters
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
    getProvince() {
        return this.province;
    }
    getDistrict() {
        return this.district;
    }
    getWard() {
        return this.ward;
    }
    getBirthday() {
        return this.birthday;
    }
    getSex() {
        return this.sex;
    }
    getJob() {
        return this.job;
    }
    getEthnic() {
        return this.ethnic;
    }
    getIdentity() {
        return this.identity;
    }
    getUserId() {
        return this.userId;
    }
    //setters
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
    setProvince(province) {
        this.province = province;
    }
    setDistrict(district) {
        this.district = district;
    }
    setWard(ward) {
        this.ward = ward;
    }
    setBirthday(birthday) {
        this.birthday = birthday;
    }
    setSex(sex) {
        this.sex = sex;
    }
    setJob(job) {
        this.job = job;
    }
    setEthnic(ethnic) {
        this.ethnic = ethnic;
    }
    setIdentity(identity) {
        this.identity = identity;
    }
    setUserId(userId) {
        this.userId = userId;
    }
}
