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
            const sql = `INSERT INTO users (id, username, password, role, phone, email, image) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const result = await db.query(sql, [
            this.getUserId(),
            this.getUsername(),
            this.getPassword(),
            this.getRole(),
            this.getPhone(),
            this.getEmail(),
            this.getImage()
            ]);

            return { isSuccess: true, data: result, userId: this.getUserId(), message: "Tạo tài khoản thành công!" };
        } catch (error) {
            console.log(error);

            return { isSuccess: false, message: error.message };
        }
    }

    async updateUser() {
        try {
            // Start building the SQL query with the fields to update
            let sql = `UPDATE users SET `;
            const values = [];
    
            // Conditionally add fields to update and store their values
            if (this.getUsername()) {
                sql += `username = ?, `;
                values.push(this.getUsername());
            }
            if (this.getPassword()) {
                sql += `password = ?, `;
                values.push(this.getPassword());
            }
            if (this.getPhone()) {
                sql += `phone = ?, `;
                values.push(this.getPhone());
            }
            if (this.getEmail()) {
                sql += `email = ?, `;
                values.push(this.getEmail());
            }
            if (this.getImage()) {
                sql += `image = ?, `;
                values.push(this.getImage());
            }
    
            // Remove the trailing comma and space
            sql = sql.slice(0, -2); 
    
            // Add the WHERE clause
            sql += ` WHERE id = ?`;
            values.push(this.getUserId());
    
            // Execute the query
            const result = await db.query(sql, values);
    
            return { 
                isSuccess: true, 
                data: result, 
                message: "Cập nhật tài khoản thành công!" 
            };
        } catch (error) {
            console.log(error);
            return { 
                isSuccess: false, 
                message: error.message 
            };
        }
    }
    
}
