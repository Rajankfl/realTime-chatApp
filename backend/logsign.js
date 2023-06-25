import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";

const app = express();
//const server = require("http").createServer(app);
import cors from "cors";
import parser from "cookie-parser";
import { db, connect } from "./dbCon.mjs";
import validator from "validator";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 8000;
connect();
app.use(parser());
app.use(cors());
app.use(express.json());

const signupSchema = new db.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new error("Email Is Invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

signupSchema.pre("save", async function (next) {
  console.log("inside pre");
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

signupSchema.methods.generateAuthToken = async function () {
  try {
    let Gentoken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: Gentoken });
    await this.save();
    return Gentoken;
  } catch (err) {
    console.log(err);
  }
};

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwTtoken;
    console.log(token);
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await Data.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    const allUser = await Data.find({});
    if (!rootUser) {
      throw new error("user not found");
    }
    req.token = token;
    req.rootUser = { rootUser, allUser };
    req.userId = rootUser._id;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized user!");
    console.log(err);
  }
};

const chatSchema = new db.Schema({
  _id: {
    type: String,
    required: true,
  },
  messages: {
    type: Array,
    required: true,
  },
});

const Data = new db.model("user", signupSchema);

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name);
  if (!name || !email || !password) {
    return res
      .status(422)
      .json({ error: "Please Fill All The Required Field" });
  } else {
    try {
      console.log(req.body);
      const userSignup = await Data.findOne({ email: email });
      if (!userSignup) {
        const data = new Data(req.body);
        await data.save();
        res.status(201).json({ message: "User Registered Sucessfully" });
      } else {
        res
          .status(403)
          .json({ message: "Provided Email Is Already Registered" });
      }
    } catch (err) {
      res.status(400).json({ message: "InValid Credentials" });
      console.log(err);
    }
  }
  // res.send('done')
});
var userId;
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please Fill All The Field" });
  } else {
    try {
      console.log(req.body);
      const userLogin = await Data.findOne({ email: email });
      if (!userLogin) {
        res.status(400).json({ error: "user error" });
        console.log(userLogin);
      } else {
        const isMatch = await bcrypt.compare(password, userLogin.password);
        const token = await userLogin.generateAuthToken();
        userId = userLogin._id;
        if (!isMatch) {
          res.status(400).json({ message: "InValid Credentials" });
        } else {
          res.cookie("jwTtoken", token, {
            expires: new Date(Date.now() + 25892000),
            httpOnly: true,
          });

          const Chat = new db.model(`${userLogin._id}`, chatSchema);
          const chatMessage = new Chat({
            _id: userId,
            messages: [{ type: "sended", message: "hello" }],
          });
          await chatMessage
            .save()
            .then(() => {
              console.log("done");
            })
            .catch((err) => {
              console.log("This is the error here " + err);
            });

          res.status(201).json({ message: "logged in Sucessfully" });
        }
      }
    } catch (err) {
      res.status(400).json({ message: "InValid Credentials" });
    }
  }
  // res.send('done')
});

app.post("/chat", Authenticate, async (req, res) => {
  try {
    const { id, myId } = req.body;
    console.log(req.body);
    const MyChat = new db.model(`${myId}`, chatSchema);

    // For only Creating My collection In User Collec
    const UserChat = new db.model(`${id}`, chatSchema);
    const UserChatData = await UserChat.findOne({ _id: myId });
    if (!UserChatData) {
      const SetMyChat = new UserChat({ _id: myId, messages: [] });
      await SetMyChat.save();
    }
    //Its ended here my id's collection is created

    //Getting The length, so we can make last message element seen
    //db['6113ecd8b5f9a3048cb11627'].updateOne({$and:[{'_id':'61162d3926b2b42974a642b7'},{'messages.13.status':'unseen'}]},{$set:{'messages.13.status':'seen'}})

    const chatData = await MyChat.findOne({ _id: id });
    if (!chatData) {
      const SetChat = new MyChat({ _id: id, messages: [] });
      await SetChat.save();
      //res.send(chatData);
      res.status(403).json({ message: "No Message yet" });
    } else {
      let lengthOfUserMessages = UserChatData.messages.length;
      let length = lengthOfUserMessages - 1;
      console.log("length is" + length);
      UserChat.updateOne(
        { _id: myId },
        { $set: { [`messages.${length}.status`]: "seen" } },
        (err, res) => {
          if (err) console.log("Error While Making seen " + err);
        }
      );
      res.send(chatData);
      //res.status(201).json({ message: 'chat document created' })
    }
  } catch (err) {
    res.status(400).json({ message: "InValid User Id" });
    console.log("thos error " + err);
  }
});

app.post("/chatMessage", Authenticate, async (req, res) => {
  try {
    const { message, id, myId, lengthOfMessage } = req.body;
    console.log(req.body);

    // my & friend collection connection here
    const MyChat = new db.model(`${myId}`, chatSchema);
    const FriendChat = new db.model(`${id}`, chatSchema);

    //Updating My & Friend chat collection with newly sended message
    //db['6113ecd8b5f9a3048cb11627'].updateOne({'_id':'61162d3926b2b42974a642b7'},{$push:{'messages':{'type':'sended','message':'hello','status':'unseen'}}})
    MyChat.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          messages: {
            type: "sended",
            message,
            status: "unseen",
            messageId: lengthOfMessage + 1,
          },
        },
      },
      { new: true, useFindAndModify: false }
    )
      .then((respond) => res.status(200).send(respond))
      .catch((err) => console.log("error occured on myChat update " + err));
    //console.log('res from mongodb update ' + res.messages);

    FriendChat.findByIdAndUpdate(
      { _id: myId },
      {
        $push: {
          messages: {
            type: "receive",
            message,
            status: "unseen",
            messageId: lengthOfMessage + 1,
          },
        },
      },
      { new: true, useFindAndModify: false },
      (err, res) => {
        if (err) console.log(err);
      }
    );
  } catch (err) {
    res.status(400).json({ message: "unable to fetch data" });
    console.log(err);
  }
});

app.post("/deleteMessage", Authenticate, async (req, res) => {
  try {
    const { id, myId, messId } = req.body;
    //Fetching data for deletion
    const MyChat = new db.model(`${myId}`, chatSchema);
    const FriendChat = new db.model(`${id}`, chatSchema);

    //Deleting the given id message from My & friend collection
    //db['6113ecd8b5f9a3048cb11627'].updateOne({$and:[{'_id':'61162d3926b2b42974a642b7'},{'messages.messageId':13}]},{$set:{'messages.$.message':'user unsent message'}})
    MyChat.findOneAndUpdate(
      { $and: [{ _id: id }, { "messages.messageId": messId }] },
      { $set: { "messages.$.message": "User Unsent Message" } },
      { new: true, useFindAndModify: false }
    )
      .then((respond) => res.status(200).send(respond))
      .catch((err) =>
        console.log("error occured on deleting my own Message " + err)
      );

    FriendChat.updateOne(
      { $and: [{ _id: myId }, { "messages.messageId": messId }] },
      { $set: { "messages.$.message": "User Unsent Message" } },
      (err, res) => {
        if (err) console.log("Error while deleting Friend message " + err);
      }
    );
  } catch (err) {
    res.status(400).json({ message: "Unable To Delete Message" });
    console.log(err);
  }
});

app.get("/logout", (req, res) => {
  try {
    //Sending the updated messages object to client
    res.clearCookie("jwTtoken", { path: "/" });
    res.status(201).send("User LoggedOut");
  } catch (err) {
    res.status(400).json({ message: "Unable To Logout" });
    console.log(err);
  }
});

/*addData();
app.get('/', (req, res) => {
    res.end('hello done')
})
*/
app.get("/about", Authenticate, (req, res) => {
  //res.send(req.headers.cookie)
  res.send(req.rootUser);
});

if (process.env.NODE_ENV == "production") {
  app.use(express.static("frontend/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}
app.listen(port, (err) => {
  console.log(`at ${port}`);
});
