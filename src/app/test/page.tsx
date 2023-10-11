"use client";
import React, { useRef, useState } from "react";

type Props = {};

export default function Page({}: Props) {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handlePointerDown() {
    timer();
  }
  function handlePointerUp() {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
  }

  function timer() {
    timerRef.current = setTimeout(() => {
      setIsLongPressed(true);
      console.log("working");
    }, 500);
  }

  return (
    <div className="yyy">
      <button onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        Click
      </button>
      {isLongPressed && <p>It is working</p>}
    </div>
  );
}
