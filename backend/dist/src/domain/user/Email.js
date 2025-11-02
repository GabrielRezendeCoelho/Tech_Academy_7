"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const ValueObject_1 = require("../shared/ValueObject");
class Email extends ValueObject_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(email) {
        if (!this.isValid(email)) {
            throw new Error('Invalid email format');
        }
        return new Email({ value: email.toLowerCase().trim() });
    }
    static isValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    getValue() {
        return this.props.value;
    }
}
exports.Email = Email;
