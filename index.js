import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

const Schema = mongoose.Schema;

// Create Schema
const ItemSchema = new Schema({
  name: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Item = mongoose.model("item", ItemSchema);

app.get("/", (req, res) =>
  Item.find()
    .sort({ date: -1 })
    .then((items) => res.json(items))
    .catch((err) => console.error(err))
);

app.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    console.log(req.body.name);
    await session.withTransaction(async () => {
      const data = { name: req.body.name };
      await Item.create([data], { session: session });
      throw new Error("asdasd"); // test transaction
    });
    res.json({});
  } catch (error) {
    console.error(error);
    res.send(error);
  } finally {
    await session.endSession();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port PORT ${PORT}`);
});
