import React from "react";
import ReactDOM from "react-dom";
import { App } from './app';
import { ThirdwebSDKProvider } from "@thirdweb-dev/react";
import { ethers } from "ethers";

const app = (
    <ThirdwebSDKProvider
      signer={new ethers.providers.Web3Provider(window.ethereum).getSigner()} 
      >
      <App />
    </ThirdwebSDKProvider>);

ReactDOM.render(app, document.getElementById("root"));