import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import Client from "./Client";

class Invoice extends Model {
  declare id: number;
  declare userId: number;
  declare clientId: number;
  declare invoiceNumber: string;
  declare issueDate: Date;
  declare dueDate: Date;
  declare status: "draft" | "sent" | "paid";
  declare subtotal: number;
  declare vatRate: number;
  declare vatAmount: number;
  declare totalAmount: number;
}

Invoice.init(
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
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "sent", "paid"),
      allowNull: false,
      defaultValue: "draft",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 25.5,
    },
    vatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "invoices",
    modelName: "Invoice",
  },
);

Invoice.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Invoice, { foreignKey: "userId" });

Invoice.belongsTo(Client, { foreignKey: "clientId" });
Client.hasMany(Invoice, { foreignKey: "clientId" });

export default Invoice;
