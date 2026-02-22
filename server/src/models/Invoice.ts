import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";
import Client from "./Client";
import PaymentTerm from "./PaymentTerm";

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
  declare discountPercent: number | null;
  declare discountDays: number | null;
  declare paymentTermId: number | null;
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
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    discountDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

// onDelete: SET NULL — jos maksuehto poistetaan, lasku säilyttää snapshot-tiedot
Invoice.belongsTo(PaymentTerm, { foreignKey: "paymentTermId", onDelete: 'SET NULL' });
PaymentTerm.hasMany(Invoice, { foreignKey: "paymentTermId" });

export default Invoice;
