"use client";

import { useEffect } from "react";

export default function MobileSchedulePage() {
  useEffect(() => {
    window.location.replace("/?view=phone");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#090909",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      모바일 화면을 불러오는 중입니다.
    </div>
  );
}
