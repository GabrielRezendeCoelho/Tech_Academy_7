"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const ValueObject_1 = require("../shared/ValueObject");
class Money extends ValueObject_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(amount, currency = 'BRL') {
        if (amount < 0) {
            throw new Error('Money amount cannot be negative');
        }
        return new Money({ amount, currency });
    }
    getAmount() {
        return this.props.amount;
    }
    getCurrency() {
        return this.props.currency;
    }
    add(money) {
        if (this.props.currency !== money.props.currency) {
            throw new Error('Cannot add money with different currencies');
        }
        return Money.create(this.props.amount + money.props.amount, this.props.currency);
    }
    subtract(money) {
        if (this.props.currency !== money.props.currency) {
            throw new Error('Cannot subtract money with different currencies');
        }
        const result = this.props.amount - money.props.amount;
        if (result < 0) {
            throw new Error('Insufficient funds');
        }
        return Money.create(result, this.props.currency);
    }
}
exports.Money = Money;
