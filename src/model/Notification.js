import db from "../config/db.js";
import { v4 as uuid4 } from "uuid";
class Notification {
    constructor(senderId, reciverId, message) {
        this.senderId = senderId;
        this.reciverId = reciverId;
        this.message = message;
    }

    async save() {
        try {
            const query = "INSERT INTO `notifycation`(`id`, `senderId`, `reciverId`, `message`) VALUES (?,?,?,?)";
            const [result] = await db.query(query, [uuid4(), this.senderId, this.reciverId, this.message]);
            if (result.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
    async updateType(reciverId) {
        const query = "UPDATE `notifycation` SET `isRead`='?' WHERE reciverId = ?";
        try {
            const [result] = await db.query(query, [1, reciverId]);
            if (result.affectedRows > 0) {
                return {
                    isSuccess: true,
                    message: "Thành công",
                };
            }
            return {
                isSuccess: false,
                message: "Thất bại",
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }

    async get(reciverId, limit = 0) {
        try {
            const [result] = await db.query(`SELECT * FROM notifycation WHERE reciverId = ? ORDER BY createdAt DESC LIMIT ?`, [reciverId, +limit]);

            return {
                isSuccess: true,
                data: result || [],
            };
        } catch (error) {
            console.log(error);
            return {
                isSuccess: false,
                message: error.message,
            };
        }
    }
}
export default Notification;
