import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class Client extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare address: string;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
    modelName: 'Client',
  }
);

Client.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Client, { foreignKey: 'userId' });

export default Client;
