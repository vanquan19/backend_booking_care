import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
class QuestionAndAnswer {
    constructor(question, answer, type) {
        this.question = question;
        this.answer = answer;
        this.type = type;
    }

    async getAll(search, type) {
        try {
            let query = `SELECT * FROM question_and_answer WHERE 1`;
            const params = [];
    
            // Add conditions dynamically
            if (search) {
                query += ` AND (question LIKE ? OR answer LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            if (type) {
                query += ` AND type = ?`;
                params.push(type);
            }
    
            const [rows] = await db.query(query, params);
    
            return {
                isSuccess: true,
                data: rows,
                message: "Lấy danh sách câu hỏi và câu trả lời thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
    

    async getById(id) {
        try {
            const [rows] = await db.query(`SELECT * FROM question_and_answer WHERE id = ?`, [id]);
            if (rows.length === 0) {
                throw new Error("Không tìm thấy câu hỏi và câu trả lời");
            }
            return {
                isSuccess: true,
                data: rows[0],
                message: "Lấy câu hỏi và câu trả lời thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async save() {
        try {
            const [rows] = await db.query(`INSERT INTO question_and_answer (id, question, answer, type) VALUES (?, ?, ?, ?)`, [uuidv4(), this.question, this.answer, this.type]);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi lưu câu hỏi và câu trả lời");
            }
            return {
                isSuccess: true,
                message: "Lưu câu hỏi và câu trả lời thành công",
            };
        } catch (error) {
            console.log(error);

            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async update(id) {
        try {
            const [rows] = await db.query(`UPDATE question_and_answer SET question = ?, answer = ?, type = ? WHERE id = ?`, [this.question, this.answer, this.type, id]);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi cập nhật câu hỏi và câu trả lời");
            }
            return {
                isSuccess: true,
                message: "Cập nhật câu hỏi và câu trả lời thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async delete(id) {
        try {
            const [rows] = await db.query(`DELETE FROM question_and_answer WHERE id = ?`, [id]);
            if (rows.affectedRows === 0) {
                throw new Error("Có lỗi xảy ra khi xóa câu hỏi và câu trả lời");
            }
            return {
                isSuccess: true,
                message: "Xóa câu hỏi và câu trả lời thành công",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
}

export default QuestionAndAnswer;
