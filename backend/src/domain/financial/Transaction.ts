import { Entity } from '../shared/Entity';
import { Money } from './Money';
import { Category } from './Category';

interface TransactionProps {
  amount: Money;
  category: Category;
  date: Date;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
}

export class Transaction extends Entity<number> {
  private props: TransactionProps;

  private constructor(id: number, props: TransactionProps) {
    super(id);
    this.props = props;
  }

  public static create(
    id: number,
    amount: Money,
    category: Category,
    type: 'INCOME' | 'EXPENSE',
    description?: string,
    date?: Date
  ): Transaction {
    return new Transaction(id, {
      amount,
      category,
      type,
      description,
      date: date || new Date()
    });
  }

  public getAmount(): Money {
    return this.props.amount;
  }

  public getCategory(): Category {
    return this.props.category;
  }

  public getDate(): Date {
    return this.props.date;
  }

  public getDescription(): string | undefined {
    return this.props.description;
  }

  public getType(): 'INCOME' | 'EXPENSE' {
    return this.props.type;
  }

  public isExpense(): boolean {
    return this.props.type === 'EXPENSE';
  }

  public isIncome(): boolean {
    return this.props.type === 'INCOME';
  }
}