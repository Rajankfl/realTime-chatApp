import React, { useEffect, useState } from "react";
import "./styles/chatPage.css";
import Avatar from "./Avatar";
import send from "./images/paper-plane.png";
import SendId from "./components/SendID";
import apiConfig from "./config/apiConfig";

//Length-Of-Message contain intiger length of messages array, which is 1 greater then expected so someWhere you may found it being subtracted.
// Avatar is giving The Random Photo for users using their id;
export default function ChatMessage(props) {
  const [message, setMessage] = useState("");
  const [lengthOfMessage, setLengthOfMessage] = useState(null);
  const [DbMessage, setDbMessage] = useState(null);
  const id = props.id;
  const myId = props.myId;
  function gettingMessage(value) {
    setDbMessage(value);
  }
  function lengthSet(value) {
    setLengthOfMessage(value);
  }

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

      // Scroll to last when user select Every new user

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

      //Data contains the chat data of selected users which is updated with the newly sended message;
      const data = await res.json();
      //await data.messages;
      console.log(data.messages);
      setDbMessage(data.messages);
      setLengthOfMessage(data.messages.length - 1);

      //this is done so that on before parent component, we can pass the message so socket can emit to that friend for whom is sended;
      props.messageSet(message);

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
    //Getting or setting DbMessage of selected users by calling this defiened function here which set DbMessage from res get from backend;/chat
    if (id.length !== 0) {
      //<SendId id={id} myId={myId} settingLength={lengthSet} sendingMessage={gettingMessage} />
      sendId();
    }
  }, [id]);

  useEffect(() => {
    //this all is just to handle the message that was emmited from socket, which is send by the active user to me;
    if (props.newMessage !== null && DbMessage.length !== 0) {
      console.log("received from socket");

      //newMessage[1] contain the _id of that user who sended message & if i have selected that user then only DbMessage is changed by newMessage that user sended;
      //likely issue of getting the emitted message from socket is prevented;
      if (id == props.newMessage[1]) {
        setDbMessage([...DbMessage, props.newMessage[0]]);
        setLengthOfMessage(lengthOfMessage + 1);
      }
    }
  }, [props.newMessage]);

  useEffect(() => {
    if (DbMessage !== null && DbMessage.length !== 0) {
      let last = document.getElementById("message").lastElementChild;
      console.log(last);
      last.setAttribute("id", "last");
      document.getElementById("last").scrollIntoView(true);
    }
  }, [DbMessage]);

  console.log(id);
  function addMessage() {
    //just for making the sendMessage field empty after message is sended;
    let data1 = document.getElementById("data");
    // console.log(data)
    console.log(message);
    if (message.length !== 0) {
      sendMessage();
      setMessage("");
    }

    data1.value = "";
  }
  return (
    <>
      <div className="chat" id="chat">
        {DbMessage !== null ? (
          <>
            <div className="user">
              <div className="profile">
                <Avatar name={id} />
                <h2 className="userName">{props.name}</h2>
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
                      <div className={val.type === "sended" ? "right" : "left"}>
                        {/* Multiple Ternary Statements for Properly setting the seen Status */}
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
                  <p className="selectOthers" style={{ fontFamily: "Oswald" }}>
                    No Conversation Yet with {props.name}, Start Convo!
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
    </>
  );
}
