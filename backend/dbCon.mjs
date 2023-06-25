import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const password = process.env.password;
const connect = () => {
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    })
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
export { mongoose as db, connect };
