import db from "../config/db.js";
export default class User {
    constructor(userId, username, password, role, phone, email, image, token) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.email = email;
        this.image = image;
        this.token = token;
    }

    getUsername() {
        return this.username;
    }
    getPassword() {
        return this.password;
    }
    getRole() {
        return this.role;
    }
    setUsername(username) {
        this.username = username;
    }
    setPassword(password) {
        this.password = password;
    }
    setRole(role) {
        this.role = role;
    }

    getPhone() {
        return this.phone;
    }
    getEmail() {
        return this.email;
    }
    getImage() {
        return this.image;
    }
    getToken() {
        return this.token;
    }
    setPhone(phone) {
        this.phone = phone;
    }

    setEmail(email) {
        this.email = email;
    }
    setImage(image) {
        this.image = image;
    }
    setToken(token) {
        this.token = token;
    }

    setUserId(userId) {
        this.userId = userId;
    }
    getUserId() {
        return this.userId;
    }

    async createUser() {
        try {
            const sql = `INSERT INTO users (id, username, password, role, phone, email, image) VALUES ('${this.getUserId()}', '${this.getUsername()}', '${this.getPassword()}', '${this.getRole()}', '${this.getPhone()}', '${this.getEmail()}', '${this.getImage()}')`;
            const result = await db.query(sql);

            return { isSuccess: true, data: result, userId: this.getUserId(), message: "Tạo tài khoản thành công!" };
        } catch (error) {
            console.log(error);

            return { isSuccess: false, message: error.message };
        }
    }

    async updateUser() {
        try {
            let sql = `UPDATE users SET 
                ${this.getUsername() ? `username = '${this.getUsername()}',` : ""}
                ${this.getPassword() ? `password = '${this.getPassword()}',` : ""}
                ${this.getPhone() ? `phone = '${this.getPhone()}',` : ""}
                ${this.getEmail() ? `email = '${this.getEmail()}',` : ""}
                ${this.getImage() ? `image = '${this.getImage()}',` : ""}
                WHERE id = '${this.getUserId()}'
            `;
            sql = sql.replace(/,\s*WHERE/, " WHERE");
            const result = await db.query(sql);

            return { isSuccess: true, data: result, message: "Cập nhật tài khoản thành công!" };
        } catch (error) {
            console.log(error);

            return { isSuccess: false, message: error.message };
        }
    }
}
