import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Avatar from "./Avatar";
import apiConfig from "./config/apiConfig";
function Users(props) {
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState("");
  const history = useHistory();
  const callAbout = async () => {
    try {
      const res = await fetch(`${apiConfig.baseURL}/about`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      setMyId(data.rootUser._id);
      setUsers(data.allUser);

      if (!res.status === 200) {
        throw new Error("fail");
      }
    } catch (err) {
      console.log(err);
      history.push("/login");
    }
  };
  useEffect(() => {
    callAbout();
  }, []);

  return (
    <React.Fragment>
      <div className="users">
        {users.map((val) => {
          if (val._id !== myId) {
            return (
              <React.Fragment>
                <div
                  className="user"
                  onClick={() => {
                    if (props.state) {
                      props.id(val._id, myId, val.name);
                      history.push(`/mobochat/${val.name}/${myId}/${val._id}`);
                    } else {
                      props.id(val._id, myId, val.name);
                    }
                  }}
                >
                  {props.online.some((elem) => {
                    return val._id === elem.userId;
                  }) ? (
                    <div className="onlineUser"> &nbsp;&nbsp;&nbsp;</div>
                  ) : null}
                  <Avatar name={val._id}></Avatar>

                  <div className="detial">
                    <h2>{val.name}</h2>
                    <p style={{ width: "100%", textOverflow: "ellipsis" }}>
                      {val.email}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          }
          return <></>;
        })}
      </div>
    </React.Fragment>
  );
}
export { Users };
