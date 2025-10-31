import { AggregateRoot } from '../shared/AggregateRoot';
import { Email } from './Email';

interface UserProps {
  name: string;
  email: Email;
  passwordHash: string;
  createdAt: Date;
  isActive: boolean;
}

export class User extends AggregateRoot<number> {
  private props: UserProps;

  private constructor(id: number, props: UserProps) {
    super(id);
    this.props = props;
  }

  public static create(
    id: number,
    name: string,
    email: Email,
    passwordHash: string,
    createdAt?: Date
  ): User {
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

  public getName(): string {
    return this.props.name;
  }

  public getEmail(): Email {
    return this.props.email;
  }

  public getPasswordHash(): string {
    return this.props.passwordHash;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public isUserActive(): boolean {
    return this.props.isActive;
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.addDomainEvent({
      type: 'UserDeactivated',
      aggregateId: this.getId()
    });
  }

  public activate(): void {
    this.props.isActive = true;
    this.addDomainEvent({
      type: 'UserActivated',
      aggregateId: this.getId()
    });
  }

  public updateName(newName: string): void {
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