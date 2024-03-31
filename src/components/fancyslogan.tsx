"use client";
import React, { useState } from "react";
import Typewriter from "typewriter-effect";

const keywords = [
  "High-Performance",
  "Parallel",
  "Programmable",
  "Power-Efficient",
  "Programmer-Friendly",
];

export default function FancySlogan() {
  const [currentIdx, setCurrentIdx] = useState(0);

  setTimeout(() => {
    setCurrentIdx((currentIdx + 1) % keywords.length);
  }, 3000);

  return (
    <div className="font-serif text-2xl md:text-3xl text-center">
      <span className="text-4xl md:text-5xl align-middle">&#8203;</span>
      <div className="inline-block">
        <Typewriter
          options={{
            strings: keywords.map((s: string) =>
              s.replaceAll(
                "P",
                '<span class="text-4xl md:text-5xl text-primary align-middle">P</span>'
              )
            ),
            autoStart: true,
            loop: true,
          }}
        ></Typewriter>
      </div>
      <span className="md:hidden">
        <br />
      </span>
      Computer Engineering Lab
    </div>
  );
}
