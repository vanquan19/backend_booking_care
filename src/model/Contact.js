import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
class Contact {
    constructor(name, email, phone, description, status) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.description = description;
        this.status = status;
    }

    async save() {
        try {
            const res = await db.query("INSERT INTO contacts (id, name, email, phone, description) VALUES (?, ?, ?, ?, ?)", [uuidv4(), this.name, this.email, this.phone, this.description]);
            if (res.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi thêm contact");
            }
            return {
                isSuccess: true,
                message: "Liên hệ đã được gửi đi, chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể",
            };
        } catch (err) {
            console.log(err);
            return {
                isSuccess: false,
                message: err.message,
            };
        }
    }

    async updateStatus() {
        try {
            const res = await db.query("UPDATE contacts SET status = ? WHERE id = ?", [this.status, this.id]);
            if (res.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi cập nhật status");
            }
            return {
                isSuccess: true,
                message: "Cập nhật trạng thái thành công",
            };
        } catch (err) {
            console.log(err);
            return {
                isSuccess: false,
                message: err.message,
            };
        }
    }

    async get() {
        try {
            const [result] = await db.query("SELECT * FROM contacts WHERE status = ?", [this.status]);

            return {
                isSuccess: true,
                data: result,
            };
        } catch (err) {
            console.log(err);
            return {
                isSuccess: false,
                message: err.message,
            };
        }
    }

    async getAmount() {
        // 1: chưa liên hệ, 2: đã phản hồi, 3: không phản hồi
        try {
            //query get status group by status
            const statusNames = { 1: "Chưa liên hệ", 2: "Đã phản hồi", 3: "Không phản hồi" };
            const [datas] = await db.query(`
                   SELECT 
                        s.status,
                        COUNT(a.status) AS total
                    FROM 
                        (SELECT 1 AS status UNION ALL
                        SELECT 2 AS status UNION ALL
                        SELECT 3 AS status ) AS s
                    LEFT JOIN 
                        contacts a 
                        ON a.status = s.status
                    GROUP BY s.status;
          `);

            //create data
            const results = datas.map((row) => ({
                name: statusNames[row.status],
                status: row.status,
                total: row.total,
            }));

            return {
                isSuccess: true,
                data: results,
            };
        } catch (err) {
            console.log(err);
            return {
                isSuccess: false,
                message: err.message,
            };
        }
    }
    setId(id) {
        this.id = id;
    }

    setStatus(status) {
        this.status = status;
    }
}
export default Contact;
