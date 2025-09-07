import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Saldo extends Model {
  public id!: number;
  public valor!: number;
  public userId!: number;
  public categoriaId!: number;
  public data!: Date;
}

Saldo.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  origem: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Saldo',
  tableName: 'saldos',
  timestamps: false,
});

export default Saldo;
