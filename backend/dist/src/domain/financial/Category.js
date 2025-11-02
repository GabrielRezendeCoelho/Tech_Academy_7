"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const ValueObject_1 = require("../shared/ValueObject");
class Category extends ValueObject_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(name, description) {
        if (!name || name.trim().length === 0) {
            throw new Error('Category name is required');
        }
        return new Category({ name: name.trim(), description });
    }
    getName() {
        return this.props.name;
    }
    getDescription() {
        return this.props.description;
    }
}
exports.Category = Category;
