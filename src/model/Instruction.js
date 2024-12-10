import db from "../config/db.js";
class Instruction {
    constructor(content) {
        this.content = content;
    }

    async save() {
        try {
            const [rows] = await db.query(`INSERT INTO instruction_booking (data) VALUES (?)`, [this.content]);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi lưu hướng dẫn");
            }
            return {
                isSuccess: true,
                message: "Lưu hướng dẫn thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async update() {
        try {
            const [rows] = await db.query(`UPDATE instruction_booking SET data = ?`, [this.content]);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi cập nhật hướng dẫn");
            }
            return {
                isSuccess: true,
                message: "Cập nhật hướng dẫn thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async get() {
        try {
            const [rows] = await db.query(`SELECT * FROM instruction_booking`);
            return {
                isSuccess: true,
                data: rows[0].data || rows[1].data || "",
                message: "Lấy hướng dẫn thành công",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async delete() {
        try {
            const [rows] = await db.query(`DELETE FROM instruction_booking`);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi xóa hướng dẫn");
            }
            return {
                isSuccess: true,
                message: "Xóa hướng dẫn thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
}
export default Instruction;
