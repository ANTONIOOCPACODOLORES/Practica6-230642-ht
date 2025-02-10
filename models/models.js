import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionID: { type: String, required: true, unique: true },
  userID: { type: String, required: true },
  status: { type: String, enum: ["Activa", "Inactiva"], default: "Activa" },
  lastAccess: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
