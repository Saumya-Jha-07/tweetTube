import cookieParser from "cookie-parser";
import express from "express";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,

  // aur bhi hota hai , read acc to need .
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());

export { app };
