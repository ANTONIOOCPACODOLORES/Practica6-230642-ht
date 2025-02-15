import mongoose from 'mongoose';

const mongoURI= "mongodb+srv://SessionsAWI:unamanzana@awicluster.6cxbh.mongodb.net/SessionsAWI?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000, // 15 segundos de espera antes de fallar
        });
        console.log("✅ Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
