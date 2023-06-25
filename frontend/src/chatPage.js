import React, { useEffect, useRef, useState } from "react";
//all users registered is fetched from Users component;
import { Users } from "./user";
import "./styles/chatPage.css";
//To perform The chat data fetching & sending message ChatMessage component is used;
// for mobile devices its totally diffrent we have redirected them to new url with component MoboMessage;
import ChatMessage from "./ChatMessage";
import { io } from "socket.io-client";
import { useHistory } from "react-router";
//io here is playing important role for real time chat;
export default function Chat() {
  const history = useHistory();
  // id , name, myId is all fetched or passed from child component Users
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [myId, setMyId] = useState("");

  //State is playing role to provide chat system for mobile & computer device according to the user media screen; true if mobile device & redirect to /moboChat;
  const [state, setState] = useState(false);

  //Message here contain the new message user sended, which is to be emitted to that friend;
  const [message, setMessage] = useState("");

  //newMessage contain the data that is only emitted to that user for whom that message is;
  const [newMessage, setNewMessage] = useState(null);

  //availableUsers here contain total active users conected with socket backend, role here is checks if user for whom message is to be sended if he is connected to socket if not
  //socket wont get that message !cons;
  const [availableUsers, setAvailableUsers] = useState([]);
  const socket = useRef();

  useEffect(() => {
    //checks if device is mobile;
    if (window.matchMedia("(max-width: 1010px)").matches) {
      document.getElementById("chat").style.display = "none";
      setState(true);
    }
  }, []);

  useEffect(() => {
    socket.current = io("https://socket-api-rajan.herokuapp.com/");
    console.log("connected");

    //getting message from socket if is emitted for me;
    socket.current.on("getMessage", async (newMessage) => {
      await newMessage;
      console.log("this is from socket" + newMessage[0].message);
      setNewMessage(newMessage);
    });
  }, []);

  useEffect(() => {
    socket.current.on("getUsers", async (users) => {
      await users;
      //getting connected users;
      setAvailableUsers(users);
      console.log(users);
    });
    if (
      message.length !== 0 &&
      availableUsers.length !== 0 &&
      availableUsers.some((val) => {
        return val.userId === id;
      })
    ) {
      //sending the sended message by me to friend to socket id of my friend;
      console.log("socket emit" + id, myId, message);
      socket.current.emit("sendMessage", myId, id, message);
    }
  }, [message]);

  useEffect(() => {
    //adding mySelf to socket if myId isnt null;
    if (myId !== undefined) {
      socket.current.emit("addUser", myId);
    }
  }, [myId]);

  function gettingMessage(message) {
    //getting message by using callback method from child component chatMessage;
    setMessage(message);
  }

  function idSet(Uid, myId, name) {
    //getting about the chat detials from child component users;
    setId(Uid);
    setMyId(myId);
    setName(name);
  }
  return (
    <>
      <div
        className="logoutAll"
        style={{
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          zIndex: 10,
          marginTop: "1%",
        }}
      >
        <h1 className="logout" style={{ marginLeft: "72vw" }}>
          Logout
        </h1>
        <i
          class="bi bi-box-arrow-right"
          id="logoutIcon"
          style={{ color: "blue", marginLeft: "1%" }}
          onClick={() => {
            history.push("/logout");
          }}
        ></i>
      </div>
      <div className="all">
        <section>
          <div className="dashboard" id="dashboard">
            <div className="head">
              <div className="search">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search..." />
              </div>
              <i
                className="bi bi-chat-right-text-fill"
                style={{ color: "blueviolet" }}
              ></i>
            </div>
            <Users id={idSet} state={state} online={availableUsers} />
          </div>
          <ChatMessage
            name={name}
            id={id}
            myId={myId}
            messageSet={gettingMessage}
            newMessage={newMessage}
          />
        </section>
      </div>
    </>
  );
}
