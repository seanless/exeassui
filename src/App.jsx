import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./view/home";
import Login from "./view/login";

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path={"/exeassui/home/*"} element={<Home />} />
      </Routes>
    </>
  );
};

export default App;
