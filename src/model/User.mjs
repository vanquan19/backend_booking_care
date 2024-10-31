export default class User {
    constructor(username, password, role, phone, email, image, token) {
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
}
