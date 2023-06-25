import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import "./styles/chatPage.css";
import Avatar from "./Avatar";
import send from "./images/paper-plane.png";
import { io } from "socket.io-client";
import apiConfig from "./config/apiConfig";
export default function MoboChat() {
  var { name, id, myId } = useParams();
  const [lengthOfMessage, setLengthOfMessage] = useState(null);
  const history = useHistory();
  const [message, setMessage] = useState("");
  const [DbMessage, setDbMessage] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const socket = useRef();

  useEffect(() => {
    socket.current = io("https://socket-api-rajan.herokuapp.com/");
    console.log("connected");
    socket.current.on("getMessage", async (newMessage) => {
      await newMessage;
      console.log("this is from socket" + newMessage[0].message);
      setNewMessage(newMessage);
    });
  }, []);

  useEffect(() => {
    socket.current.on("getUsers", async (users) => {
      await users;
      setAvailableUsers(users);
      console.log(users);
    });
  }, [message]);

  function sendToFriend() {
    if (
      message.length !== 0 &&
      availableUsers.length !== 0 &&
      availableUsers.some((val) => {
        return val.userId === id;
      })
    ) {
      console.log("socket emit" + id, myId, message);
      socket.current.emit("sendMessage", myId, id, message);
    }
  }
  useEffect(() => {
    console.log("Not IterateAble MEssage " + DbMessage);
    if (DbMessage !== null && newMessage !== null && id === newMessage[1]) {
      //let prev = DbMessage;
      setDbMessage([...DbMessage, newMessage[0]]);
    }
  }, [newMessage]);

  const sendId = async () => {
    try {
      const res = await fetch(`${apiConfig.baseURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, myId }),
      });
      const data = await res.json();

      if (res.status === 201 || res.status === 200) {
        //DbMessage is set the data.messages because i want to use that object being broadcasted from socket i.e an object {type.....} like so same array content is sended;
        setDbMessage(data.messages);
        setLengthOfMessage(data.messages.length - 1);
      }

      //If user havent till chat convo with the one he/she selected then we have set the DbMessage as null array[];
      if (res.status === 403) {
        setDbMessage([]);
      }

      //selected or given id of user isnt registered properly, so that we got this response.
      if (res.status === 400) {
        window.alert("user Doesnt Exist");
      }

      /* Scroll to last when user select Every new user */

      let last = document.getElementById("message").lastElementChild;
      console.log(last);
      last.setAttribute("id", "last");
      document.getElementById("last").scrollIntoView(true);

      //If nothing works good then we are passing fail Error;
      if (!res.status === 200) {
        throw new Error("fail");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const sendMessage = async () => {
    try {
      const res = await fetch(`${apiConfig.baseURL}/chatMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, id, myId, lengthOfMessage }),
      });
      const data = await res.json();
      setDbMessage(data.messages);
      setLengthOfMessage(data.messages.length - 1);

      /* Scroll to last when user send Chat Message */

      let last = document.getElementById("message").lastElementChild;
      console.log(last);
      last.setAttribute("id", "last");
      document.getElementById("last").scrollIntoView(true);

      if (!res.status === 200) {
        throw new Error("fail");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteMessage = async (messageId) => {
    //console.log(lengthOfMessage)
    console.log("db hre " + messageId + " ");
    try {
      const res = await fetch(`${apiConfig.baseURL}/deleteMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, myId, messId: messageId }),
      });
      const data = await res.json();
      setDbMessage(data.messages);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (myId !== undefined) {
      socket.current.emit("addUser", myId);
    }
  }, [myId]);
  useEffect(() => {
    if (id.length !== 0) {
      sendId();
    }
  }, [id]);
  console.log(id);
  function addMessage() {
    let data1 = document.getElementById("data");
    // console.log(data)
    console.log(message);
    sendMessage();
    sendToFriend();
    data1.value = "";
  }
  return (
    <>
      <div className="all">
        <section>
          <div className="chat" id="chat">
            {DbMessage !== null ? (
              <>
                <div className="user">
                  <div className="profile">
                    <Avatar name={id} />
                    <h2 className="userName">{name}</h2>
                  </div>
                  <div className="action">
                    <i
                      className="bi bi-chat-right-quote"
                      style={{ color: "blueviolet" }}
                    ></i>
                    <i className="bi bi-camera-video-fill"></i>
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                </div>
                <div className="messages" id="message">
                  {DbMessage.length !== 0 ? (
                    DbMessage.map((val, lengthMap) => {
                      return (
                        <React.Fragment>
                          <div
                            className={val.type === "sended" ? "right" : "left"}
                          >
                            {val.type !== "sended" ? (
                              <Avatar name={id} />
                            ) : lengthMap === lengthOfMessage &&
                              val.status === "seen" ? (
                              <div className="seen">
                                <Avatar name={id}></Avatar>
                              </div>
                            ) : null}
                            <p className={val.type}>{val.message}</p>
                            <div className="deleteAction">
                              <input
                                type="button"
                                value="Delete"
                                onClick={() => {
                                  deleteMessage(lengthMap);
                                  console.log("deleted");
                                }}
                              />
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <div className="noMessages">
                      <p
                        className="selectOthers"
                        style={{ fontFamily: "Oswald" }}
                      >
                        No Conversation Yet with {name}, Start Convo!
                      </p>
                    </div>
                  )}
                </div>
                <div className="sendMessages">
                  <input
                    type="text"
                    placeholder="Write a Message"
                    id="data"
                    autoComplete="off"
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                    autoFocus={true}
                    onBlur={({ target }) => target.focus()}
                  />
                  <img
                    src={send}
                    alt="sendMessage"
                    style={{ height: "20px", width: "20px", marginLeft: "-5%" }}
                    id="send"
                    onClick={addMessage}
                  />
                  <div className="sendIcons">
                    <i className="bi bi-mic-fill"></i>
                    <i className="bi bi-file-earmark-diff"></i>
                  </div>
                </div>
              </>
            ) : (
              <div className="selectOne">
                <p className="notSelected" style={{ fontFamily: "Oswald" }}>
                  Please Select Anyone From Left To Chat!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
