import axios from "axios";
import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "./lib/api";
import eraser from "./assets/eraser.png";
import sketchframe1 from "./assets/sketchframe1.png";
import html2canvas from "html2canvas";

export const Prac = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);

  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D>();
  const [frameCtx, setFrameCtx] = useState<CanvasRenderingContext2D>();

  const [isPainting, setIsPainting] = useState<boolean>(false);

  const [imgs, setImgs] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //지우개 상태값
  const [erase, setErase] = useState<boolean>(false);

  //색깔 상태값
  const [color, setColor] = useState<string>("black");

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
  //? --------------------------------------- 터치  --------------------------------

  const TouchStart = (e: any) => {
    let touches = e.changedTouches;
    setIsPainting(true);
    canvasCtx?.beginPath();
    canvasCtx?.moveTo(touches[0].pageX, touches[0].pageY - 260);
  };

  const TouchMove = (e: any) => {
    let touches = e.changedTouches;
    if (erase) {
      canvasCtx?.clearRect(
        touches[0].pageX - 25,
        touches[0].pageY - 260 - 25,
        50,
        50
      );
    } else {
      canvasCtx?.lineTo(touches[0].pageX, touches[0].pageY - 260);
      canvasCtx?.stroke();
    }

    if (!isPainting) {
      return;
    }
    console.log(touches[0].pageX, touches[0].pageY);
  };

  //! ===========================   데이터 불러오기 및 캔버스생성  ================================
  useEffect(() => {
    getImg();
  }, []);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    const frame: HTMLCanvasElement | null = frameRef.current;

    if (canvas !== null) {
      canvas.width = 360;
      canvas.height = 290;
    }
    if (frame !== null) {
      frame.width = 360;
      frame.height = 290;
    }

    const canvasContext: CanvasRenderingContext2D | null =
      canvas === null ? null : canvas.getContext("2d");
    canvasContext !== null && setCanvasCtx(canvasContext);

    const frameContext: CanvasRenderingContext2D | null =
      frame === null ? null : frame.getContext("2d");
    frameContext !== null && setFrameCtx(frameContext);
    if (frameContext) {
      const image = new Image();
      image.src = sketchframe1;
      image.onload = function () {
        frameContext.drawImage(image, 0, 0, 360, 290);
      };
    }

    if (canvasCtx) {
      canvasCtx.lineJoin = "round";
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = color;
      const image = new Image();
      image.src = imgs;
      image.onload = function () {
        canvasCtx.drawImage(image, 0, 0);
      };
    }

    //   // setDrawDone(true);
    // });
  }, [isLoading]);

  useEffect(() => {
    if (canvasCtx) {
      canvasCtx.strokeStyle = color;
    }
  }, [color]);

  //! =======================  캡쳐   ============================

  const linkRef = useRef<any>(null);
  const captureRef = useRef<any>(null);

  const [isCapture, setIsCapture] = useState<boolean>(true);
  const onSaveAs = (uri: any, filename: any) => {
    console.log("저장");
    let link = linkRef.current;
    if (link) {
      link.href = uri;
      link.download = filename;
      link.click();
    }
  };
  const onCapture = () => {
    const capture: HTMLElement | null = captureRef.current;

    if (capture !== null && isCapture) {
      setTimeout(() => {
        setIsCapture(false);
      });
      html2canvas(capture, {
        useCORS: true,
      }).then((capture) => {
        onSaveAs(capture.toDataURL("image/png"), "image-download.png");
      });
    }
  };

  return (
    <Wrapper>
      {" "}
      <Contatiner ref={captureRef}>
        <Title>Are you 피까소?</Title>
        {/* <img className="frameimg" src={sketchframe1} alt="스케치북" /> */}

        <canvas className="frame" ref={frameRef}></canvas>
        <canvas
          className="canvas"
          ref={canvasRef}
          onTouchStart={TouchStart}
          onTouchMove={TouchMove}
          onTouchEnd={StopPainting}
          onTouchCancel={StopPainting}
          onMouseMove={MouseMoving}
          onMouseDown={StartPainting}
          onMouseUp={StopPainting}
          onMouseLeave={StopPainting}
        ></canvas>

        <CaptureBtn onClick={onCapture} ref={linkRef}>
          클릭해서 이미지로
        </CaptureBtn>
        <Button onClick={() => setErase(!erase)}>
          <img className="img" src={eraser} alt="지우개" />
          <img className="img" src={eraser} alt="지우개" />
          <img className="img" src={eraser} alt="지우개" />
        </Button>
        <ColorBox>
          <ColorBtn
            onClick={() => {
              setErase(false);
              setColor("black");
            }}
          />
          <ColorBtn
            className="red"
            onClick={() => {
              setErase(false);
              setColor("red");
            }}
          />
          <ColorBtn
            className="blue"
            onClick={() => {
              setErase(false);
              setColor("blue");
            }}
          />
          <ColorBtn
            className="green"
            onClick={() => {
              setErase(false);
              setColor("green");
            }}
          />
        </ColorBox>
      </Contatiner>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Contatiner = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  width: 100%;
  max-width: 375px;
  height: 100%;
  /* background-color: aliceblue; */
  .frameimg {
    position: absolute;
    z-index: -1;
    margin-top: 150px;
    width: 100%;
  }
  .canvas {
    margin-top: 260px;
    z-index: 2;
  }
  .frame {
    margin-top: 260px;
    position: absolute;
  }
`;

const CaptureBtn = styled.a``;

const CaptureSection = styled.div`
  position: fixed;

  height: 300px;
`;

const Title = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #c1c0c0;
  height: 100px;
  position: absolute;
  top: 80px;
  font-size: 24px;
  font-weight: 700;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 50%;
  bottom: 100px;
  height: 50px;
  border-radius: 10px;
  background-color: white;
  border: 1px solid black;
  .img {
    height: 30px;
  }
  :hover {
    background-color: #e4e4e4;
    cursor: pointer;
    box-shadow: none;
  }
`;

const ColorBox = styled.div`
  position: absolute;
  bottom: 50px;
  display: flex;
`;

const ColorBtn = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: black;
  margin: 0 10px;
  &.red {
    background-color: red;
  }
  &.blue {
    background-color: blue;
  }
  &.green {
    background-color: green;
  }
`;
