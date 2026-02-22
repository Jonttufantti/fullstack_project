import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class PaymentTerm extends Model {
  declare id: number;
  declare userId: number | null;
  declare label: string;
  declare netDays: number;
  declare discountPercent: number | null;
  declare discountDays: number | null;
}

PaymentTerm.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL = järjestelmän oletusehto, kaikille näkyvä
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    netDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    discountDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payment_terms',
    modelName: 'PaymentTerm',
  }
);

PaymentTerm.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PaymentTerm, { foreignKey: 'userId' });

export default PaymentTerm;
