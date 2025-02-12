import mongoose from 'mongoose';

// URL de conexión a MongoDB Atlas
const mongoURI= "mongodb+srv://SessionsAWI:unamanzana@awicluster.6cxbh.mongodb.net/?retryWrites=true&w=majority&appName=AWICluster";

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectado a MongoDB Atlas");
    } catch (error) {
        console.error(" Error conectando a MongoDB:", error);
        process.exit(1); // Detiene la aplicación si falla la conexión
    }
};

export default connectDB;
