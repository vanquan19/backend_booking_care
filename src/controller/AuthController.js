import connection from "../config/db.js";
import app from "../index.js";
import bcrypt from "bcryptjs";
import env from "dotenv";
import jwt from "jsonwebtoken";
env.config();

export default class AuthController {
    //this method will define all the routes for the user
    routes() {
        app.post("/api/v1/admin/login", this.login); //this route will be used for login
        app.post("/api/v1/refreshtoken", this.refreshToken); //this route will be used for refreshing token
        app.post("/api/v1/protected_route", AuthController.verifyToken, this.protecedRoute); //this route will be used for verifying token
    }

    //this method will be used for creating a new token for the user
    async refreshToken(req, res) {
        // get the token from the request body
        const { token } = req.body;
        // create an instance of the UserService class
        const service = new AuthService();
        // call the refreshToken method from the UserService class
        const data = await service.refreshToken(token);

        // check if the token was refreshed successfully
        if (data.isSuccess) {
            // send a success response
            res.status(200).json(data);
        } else {
            // send an error response
            res.status(401).json(data);
        }
    }

    static verifyToken = async (req, res, next) => {
        console.log("verifyToken");
        // get the token from the request body
        const authHeader = req.headers["authorization"]; // Lấy header Authorization
        const token = authHeader && authHeader.split(" ")[1]; // Token là phần sau "Bearer "
        if (!token) {
            res.status(401).json({
                isSuccess: false,
                message: "Token không hợp lệ!",
            });
            return false;
        }
        try {
            console.log("verifyToken decoding");

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                isSuccess: false,
                message: "Token không hợp lệ!",
            });
            return false;
        }
    };

    //this method will protect the route
    async protecedRoute(req, res) {
        // send a success response
        const isSuccess = req.user ? true : false;
        return isSuccess ? res.status(200).json(true) : res.status(401).json(false);
    }

    //this method will be used for authenticating the user
    async login(req, res) {
        // get the username and password from the request body
        const { username, password, role } = req.body;
        // call the login method from the UserService class
        if (!username) {
            res.status(400).json({ isSuccess: false, message: "Tài khoản không hợp lệ!" });
            return;
        }
        if (!password) {
            res.status(400).json({ isSuccess: false, message: "Mật khẩu không hợp lệ!" });
            return;
        }
        //QUERY to find user by username, email or phone
        let [[user]] = await connection.query("SELECT id, password FROM users WHERE role = ? AND (username = ? OR email = ? OR phone = ? )", [role, username, username, username]);

        if (!user) {
            res.status(400).json({ isSuccess: false, message: "Tài khoản không tồn tại!" });
            return;
        }
        // compare the password from the request body with the password from the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ isSuccess: false, message: "Mật khẩu không đúng!" });
            return;
        }
        // create a new object with the user data
        let dataUser = {};
        //check role of user
        if (role == "admin") {
            [[dataUser]] = await connection.query(
                "SELECT users.id, admin.firstname, admin.lastname, users.email, users.phone, users.image FROM users INNER JOIN admin ON users.id = admin.userID  WHERE users.id = ?",
                [user.id]
            );
        } else if (role == "doctor") {
            [[dataUser]] = await connection.query(
                "SELECT users.id, doctor.firstname, doctor.lastname, users.email, users.phone, users.image FROM users INNER JOIN doctor ON users.id = doctor.userID  WHERE users.id = ?",
                [user.id]
            );
            dataUser = rows;
        } else if (role == "patient") {
            [[dataUser]] = await connection.query(
                "SELECT users.id, patient.firstname, patient.lastname, users.email, users.phone, users.image FROM users INNER JOIN patient ON users.id = patient.userID  WHERE users.id = ?",
                [user.id]
            );
            dataUser = raws;
        } else {
            res.status(400).json({ isSuccess: false, message: "Role không hợp lệ!" });
            return;
        }

        // create a new access token and refresh token
        const accessToken = jwt.sign({ id: user.id, role: role }, process.env.JWT_SECRET, { expiresIn: "24h" });
        const refreshToken = jwt.sign({ id: user.id, role: role }, process.env.JWT_SECRET_REFRESH, { expiresIn: "7d" });
        //QUERY to update the refresh token in the database
        connection.query("UPDATE users SET refreshToken = ? WHERE id = ?", [refreshToken, user.id]);

        //data to return
        let data = {
            isSuccess: true,
            message: "Đăng nhập thành công!",
            data: dataUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };

        // send a success response
        res.status(200).json({
            isSuccess: true,
            message: "Đăng nhập thành công!",
            data: dataUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    }

    async register(req, res) {
        let { username, password } = req.body;
        username = username.trim();
        password = password.trim();
        if (!username || !password) {
            res.status(400).json({ isSuccess: false, message: "Username and password are required" });
            return;
        }
        const service = new AuthService();
    }
}
