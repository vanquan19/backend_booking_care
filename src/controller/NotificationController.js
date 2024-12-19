import app from "../index.js";
import Notification from "../model/Notification.js";

class NotificationController {
    routes() {
        app.get("/api/v1/get-notify", this.getNotify);
        app.post("/api/v1/update-notify", this.updateNotify);
    }

    async getNotify(req, res) {
        try {
            const { reciverId, limit = 0 } = req.query;
            const notify = new Notification();
            const result = await notify.get(reciverId, limit);
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                data: result.data,
            });
        } catch (error) {
            return res.status(501).json({
                isSuccess: false,
                message: error.message,
            });
        }
    }

    async updateNotify(req, res) {
        try {
            const { reciverId } = req.body;
            const notify = new Notification();
            const result = await notify.updateType(reciverId);
            if (!result.isSuccess) {
                return res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                });
            }
            return res.status(200).json({
                isSuccess: true,
                message: "Notification updated successfully",
            });
        } catch (error) {
            return res.status(501).json({
                isSuccess: false,
                message: error.message,
            });
        }
    }
}

export default new NotificationController();
