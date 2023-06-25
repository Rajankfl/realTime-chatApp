const port = process.env.PORT || 8900;
const io = require("socket.io")(port, {
  cors: {
    origin: "*",
  },
});

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
//because this remove function isnt filtering the needed way it is depreciated & now connected users are never going to reconnect
const removeUser = async (socketId) => {
  console.log("to remove " + socketId);
  console.log(users);
  users = users.filter((user) => {
    return user.socketId !== socketId;
  });
  console.log(users);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("connected");
  io.emit("message", "Hello From Server");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", (senderId, receiverId, text) => {
    const user = getUser(receiverId);
    console.log("sended Message is " + text);
    //socket.join(socket.id)
    console.log("this is user socket.id " + user.socketId);
    console.log("this is my socket.id " + socket.id);
    console.log(user);
    if (user.socketId === socket.id) {
      console.log("same so mistake");
    }
    console.log(text);
    io.to(user.socketId).emit("getMessage", [
      {
        type: "receive",
        message: text,
        status: "seen",
      },
      senderId,
    ]);
  });

  socket.on("disconnect", () => {
    console.log("this user is going to disconnect " + socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("disconnected");
  });
});
