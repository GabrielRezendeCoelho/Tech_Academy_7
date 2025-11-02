"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const AggregateRoot_1 = require("../shared/AggregateRoot");
class User extends AggregateRoot_1.AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, name, email, passwordHash, createdAt) {
        if (!name || name.trim().length === 0) {
            throw new Error('User name is required');
        }
        const user = new User(id, {
            name: name.trim(),
            email,
            passwordHash,
            createdAt: createdAt || new Date(),
            isActive: true
        });
        user.addDomainEvent({
            type: 'UserCreated',
            aggregateId: id,
            email: email.getValue(),
            name: name
        });
        return user;
    }
    getName() {
        return this.props.name;
    }
    getEmail() {
        return this.props.email;
    }
    getPasswordHash() {
        return this.props.passwordHash;
    }
    getCreatedAt() {
        return this.props.createdAt;
    }
    isUserActive() {
        return this.props.isActive;
    }
    deactivate() {
        this.props.isActive = false;
        this.addDomainEvent({
            type: 'UserDeactivated',
            aggregateId: this.getId()
        });
    }
    activate() {
        this.props.isActive = true;
        this.addDomainEvent({
            type: 'UserActivated',
            aggregateId: this.getId()
        });
    }
    updateName(newName) {
        if (!newName || newName.trim().length === 0) {
            throw new Error('User name is required');
        }
        const oldName = this.props.name;
        this.props.name = newName.trim();
        this.addDomainEvent({
            type: 'UserNameUpdated',
            aggregateId: this.getId(),
            oldName,
            newName: this.props.name
        });
    }
}
exports.User = User;
