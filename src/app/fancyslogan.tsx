"use client";
import Typewriter from "typewriter-effect";

const keywords = [
  "High-Performance",
  "Parallel",
  "Programmable",
  "Power-Efficient",
  "Programmer-Friendly",
  "Low-Power",
  "Pacific Northwest",
  "Pipelined",
  "Polymorphous",
];

export default function FancySlogan() {
  return (
    <div className="font-serif text-2xl lg:text-3xl text-center">
      <span className="text-4xl lg:text-5xl align-middle">&#8203;</span>
      <div className="inline-block">
        <Typewriter
          options={{
            strings: keywords.map((s: string) =>
              s.replaceAll(
                "P",
                '<span class="text-4xl lg:text-5xl text-secondary align-middle">P</span>',
              ),
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
