import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MASTER_DB_NAME || 'aafok_master'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export const getTenantConnection = async (tenantId) => {
  const connectionName = `tenant_${tenantId}`;
  if (mongoose.connections.find(c => c.name === connectionName)) {
    return mongoose.connections.find(c => c.name === connectionName);
  }
  const uri = process.env.MONGO_URI;
  const conn = await mongoose.createConnection(uri, {
    dbName: `${process.env.TENANT_DB_PREFIX || 'aafok_tenant_'}${tenantId}`
  }).asPromise();
  return conn;
};

export default connectDB;