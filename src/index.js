import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import VN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./app-redux/store";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider locale={VN}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>,
);

reportWebVitals();
