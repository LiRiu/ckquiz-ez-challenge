import React, { useEffect, useState } from "react";
import { helpers, commons, config } from "@ckb-lumos/lumos";
import './index.css';
import {
  Group,
  TextInput,
  IconButton,
  LogInIcon,
  ArchiveIcon,
  TickIcon,
  Spinner,
  Avatar
} from "evergreen-ui";

export function App() {
  config.initializeConfig(config.predefined.AGGRON4);
  const ethereum = window.ethereum;
  const [ethAddr, setEthAddr] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isInvalidAns, setIsInvalidAns] = useState(false);
  const [rewardPng] = useState(require("../public/item0.png"));
  const [rewardAlt] = useState("500CKB");
  const [showAlt, setShowAlt] = useState(false);
  const [quizAns, setQuizAns] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isSending, setIsSending] = useState(false);

  const url = window.location.search.split("?")[1];
  const quizText = url.split("=")[1].split("&")[0];
  const correctQuizAns = url.split("=")[2];

  useEffect(() => {
    asyncSleep(100).then(() => {
      if (ethereum.selectedAddress){ 
        setEthAddr(ethereum.selectedAddress);
      } else {
        ethereum.enable().then(([ethAddr]) => {
          setEthAddr(ethAddr);
        })
      }
    });
  }, []);

  function asyncSleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleClick(){
    if(isDone){
      console.log(txHash);
      const explorerUrl = "https://pudge.explorer.nervos.org/transaction/" + txHash;
      window.open(explorerUrl);
      return;
    }
    if(quizAns == correctQuizAns){
      setIsInvalidAns(false);
      reward();
    } else {
      setIsInvalidAns(true);
      setQuizAns("Wrong Answer...");
    } 
  }

  function getTextPlaceholder(){
    if(!ethereum){
      return "Browser without Metamask..";
    }
    if(ethereum.selectedAddress && !showAlt){
      return decodeURI(quizText);
    }

    if(ethereum.selectedAddress && showAlt){
      return rewardAlt;
    }
    return "Connect to Metamask...";
  }

  function getIcon(){
    if(!ethereum){
      return null;
    }else if(!ethereum.selectedAddress){
      return LogInIcon;
    }else if(isDone){
      return TickIcon;
    }else if(isSending){
      return Spinner;
    }else{
      return ArchiveIcon;
    }
  }

  function onChangeInput(e){
    setQuizAns(e.target.value);
  }

  function reward() {
    const omniLockScript = commons.omnilock.createOmnilockScript({ auth: { flag: "ETHEREUM", content: ethAddr } });
    const omniAddr = helpers.encodeToAddress(omniLockScript, {});
    const faucetUrl = "https://nervos-functions.vercel.app/api/faucet?target_ckt_address=" + omniAddr;
    
    setIsSending(true);
    
    fetch(faucetUrl).then((res) => res.json()).then((data) => {
      console.log(data.tx_hash);
      setTxHash(data.tx_hash);
      setIsSending(false);
      setIsDone(true);
    })
  }

  return (
    <div id={isDone ? "quiz-box-done" : "quiz-box"}>
      <Group>
        <div id={"avatar"}>
          <Avatar
            src={rewardPng}
            shape={"square"}
            size={32}
            marginRight={1}
            onMouseEnter={() => setShowAlt(true)}
            onMouseLeave={() => setShowAlt(false)}
          />
        </div>
        <TextInput
          disabled={!ethereum.selectedAddress || isDone }
          placeholder={getTextPlaceholder()}
          id={"quiz-text"}
          isInvalid={isInvalidAns}
          onChange={onChangeInput}
          onKeyUp={(e)=>{
            if(e.key === "Enter"){
              handleClick();
            }
          }}
          value={quizAns}
        />
        <IconButton
          disabled={ !ethereum }
          icon={getIcon()}
          onClick={handleClick}
        />
      </Group>
    </div>
  );

}
