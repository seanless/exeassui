import React from "react";
import ContentMain from "../component/layout/contentMain";
import Header from "../component/layout/header";
import "../asset/css/layout.css";

const Home = () => {
  return (
    <div className="layout">
      <div className="layout-header">
        <Header
        />
      </div>
      <div className="layout-middle">
        <div className="layout-middle-content">
          <ContentMain />
        </div>
      </div>
    </div>
  );
};

export default Home;
