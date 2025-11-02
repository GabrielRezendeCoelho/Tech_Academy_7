"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const Entity_1 = require("../shared/Entity");
class Transaction extends Entity_1.Entity {
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, amount, category, type, description, date) {
        return new Transaction(id, {
            amount,
            category,
            type,
            description,
            date: date || new Date()
        });
    }
    getAmount() {
        return this.props.amount;
    }
    getCategory() {
        return this.props.category;
    }
    getDate() {
        return this.props.date;
    }
    getDescription() {
        return this.props.description;
    }
    getType() {
        return this.props.type;
    }
    isExpense() {
        return this.props.type === 'EXPENSE';
    }
    isIncome() {
        return this.props.type === 'INCOME';
    }
}
exports.Transaction = Transaction;
