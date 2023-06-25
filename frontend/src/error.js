import React from "react";
import { NavLink } from "react-router-dom";
export default function Error() {
  return (
    <>
      <h1>Opps Page Not Found</h1>
      <p>
        Go to <NavLink to="/">HomePage</NavLink>
      </p>
    </>
  );
}
