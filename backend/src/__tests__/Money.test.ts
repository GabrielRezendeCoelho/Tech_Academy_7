import { Money } from '../domain/financial/Money';

describe('Money Value Object', () => {
  describe('create', () => {
    it('should create money with valid amount and default currency', () => {
      const money = Money.create(100);
      expect(money.getAmount()).toBe(100);
      expect(money.getCurrency()).toBe('BRL');
    });

    it('should create money with valid amount and custom currency', () => {
      const money = Money.create(100, 'USD');
      expect(money.getAmount()).toBe(100);
      expect(money.getCurrency()).toBe('USD');
    });

    it('should throw error for negative amount', () => {
      expect(() => Money.create(-100)).toThrow('Money amount cannot be negative');
    });

    it('should allow zero amount', () => {
      const money = Money.create(0);
      expect(money.getAmount()).toBe(0);
    });
  });

  describe('operations', () => {
    it('should add money with same currency', () => {
      const money1 = Money.create(100);
      const money2 = Money.create(50);
      const result = money1.add(money2);
      expect(result.getAmount()).toBe(150);
    });

    it('should subtract money with same currency', () => {
      const money1 = Money.create(100);
      const money2 = Money.create(30);
      const result = money1.subtract(money2);
      expect(result.getAmount()).toBe(70);
    });

    it('should throw error when adding different currencies', () => {
      const money1 = Money.create(100, 'BRL');
      const money2 = Money.create(50, 'USD');
      expect(() => money1.add(money2)).toThrow('Cannot add money with different currencies');
    });

    it('should throw error when subtracting different currencies', () => {
      const money1 = Money.create(100, 'BRL');
      const money2 = Money.create(50, 'USD');
      expect(() => money1.subtract(money2)).toThrow('Cannot subtract money with different currencies');
    });

    it('should throw error when result would be negative', () => {
      const money1 = Money.create(50);
      const money2 = Money.create(100);
      expect(() => money1.subtract(money2)).toThrow('Insufficient funds');
    });
  });

  describe('equals', () => {
    it('should be equal when amount and currency are the same', () => {
      const money1 = Money.create(100, 'BRL');
      const money2 = Money.create(100, 'BRL');
      expect(money1.equals(money2)).toBe(true);
    });

    it('should not be equal when amounts differ', () => {
      const money1 = Money.create(100, 'BRL');
      const money2 = Money.create(200, 'BRL');
      expect(money1.equals(money2)).toBe(false);
    });

    it('should not be equal when currencies differ', () => {
      const money1 = Money.create(100, 'BRL');
      const money2 = Money.create(100, 'USD');
      expect(money1.equals(money2)).toBe(false);
    });
  });
});