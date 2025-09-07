import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Categoria extends Model {
  public id!: number;
  public nome!: string;
  public descricao?: string;
}

Categoria.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Categoria',
  tableName: 'categorias',
  timestamps: false,
});

export default Categoria;
