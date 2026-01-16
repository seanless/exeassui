import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./view/home";
const App = () => {


  return (
    <>
      <Routes>
        <Route
          path={"/exeassui/home/*"}
          element={
            <Home />
          }
        ></Route>
      </Routes>
    </>
  );
};

export default App;
