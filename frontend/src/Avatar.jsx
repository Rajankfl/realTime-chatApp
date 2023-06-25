import React from "react";
import Avatars from "@dicebear/avatars";
import avataaars from "@dicebear/avatars-avataaars-sprites";
export default function Avatar(props) {
  //Avatar Image for Every Users
  const avatars = new Avatars(avataaars);

  const svg = avatars.create(`${props.name}`, {
    eyes: ["eyeRoll"],
    mouth: ["smile"],
    clothes: ["blazerAndSweater"],
    top: ["hat"],
  });
  var svg64 = btoa(unescape(encodeURIComponent(svg)));
  var image64 = "data:image/svg+xml;base64," + svg64;
  return <img src={image64} alt="profile"></img>;
}
