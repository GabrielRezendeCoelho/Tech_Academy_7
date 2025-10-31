import { ValueObject } from '../shared/ValueObject';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    return new Money({ amount, currency });
  }

  public getAmount(): number {
    return this.props.amount;
  }

  public getCurrency(): string {
    return this.props.currency;
  }

  public add(money: Money): Money {
    if (this.props.currency !== money.props.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return Money.create(this.props.amount + money.props.amount, this.props.currency);
  }

  public subtract(money: Money): Money {
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