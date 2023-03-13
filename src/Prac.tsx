import axios from "axios";
import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "./lib/api";
import eraser from "./assets/eraser.png";

export const Prac = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D>();

  const [isPainting, setIsPainting] = useState<boolean>(false);

  const [imgs, setImgs] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [erase, setErase] = useState<boolean>(false);

  //데이터베이스에서 이미지 가져오기
  const getImg = async () => {
    try {
      const { data }: any = await supabase.from("drawprac").select();
      console.log(data[0].imgurl);
      setImgs(data.at(-1).imgurl);
      setIsLoading(true);
    } catch (error) {
      console.log(error);
    }
  };

  //데이터베이스로 이미지 보내기
  const postImg = async (url: any) => {
    try {
      await supabase.from("drawprac").insert({ imgurl: url });
    } catch (error) {}
  };

  //마우스를 뗏을때
  const StopPainting = (e: any) => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    postImg(canvas?.toDataURL());
    setIsPainting(false);
  };
  //마우스 다운
  const StartPainting = (e: any) => {
    setIsPainting(true);
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    canvasCtx?.beginPath();
    canvasCtx?.moveTo(mouseX, mouseY);
  };
  //마우스 움직이면
  const MouseMoving = (e: any) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    if (!isPainting) {
      return;
    }

    if (erase) {
      canvasCtx?.clearRect(x - 25, y - 25, 50, 50);
    } else {
      canvasCtx?.lineTo(x, y);
      canvasCtx?.stroke();
    }
  };

  // }, []);

  useEffect(() => {
    getImg();
  }, []);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;

    if (canvas !== null) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;
    }

    const canvasContext: CanvasRenderingContext2D | null =
      canvas === null ? null : canvas.getContext("2d");
    canvasContext !== null && setCanvasCtx(canvasContext);

    if (canvasCtx) {
      canvasCtx.lineJoin = "round";
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#000000";
      const image = new Image();
      image.src = imgs;
      image.onload = function () {
        canvasCtx.drawImage(image, 0, 0);
      };
    }

    //   // setDrawDone(true);
    // });
  }, [isLoading]);

  return (
    <Contatiner>
      <canvas
        ref={canvasRef}
        onMouseMove={MouseMoving}
        onMouseDown={StartPainting}
        onMouseUp={StopPainting}
        onMouseLeave={() => setIsPainting(false)}
      ></canvas>
      <Button onClick={() => setErase(!erase)}>
        <img className="img" src={eraser} alt="지우개" />
        <img className="img" src={eraser} alt="지우개" />
        <img className="img" src={eraser} alt="지우개" />
        <img className="img" src={eraser} alt="지우개" />
        <img className="img" src={eraser} alt="지우개" />
      </Button>
    </Contatiner>
  );
};

const Contatiner = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: calc(100% - 100px);
  background-color: aliceblue;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 10px;
  width: 50%;
  height: 50px;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 3px 3px 0px gray;
  .img {
    height: 30px;
  }
  :hover {
    background-color: #e4e4e4;
    cursor: pointer;
    box-shadow: none;
  }
`;
