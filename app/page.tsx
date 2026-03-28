"use client";

import { useStore } from "@/store/store";
import { createRefCallback } from "@/utils/mapRefs";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const introImages = [
  {
    src: "/intro/transition-images/1.webp",
    x: "-88%",
    y: "34%",
    z: -250,
  },
  {
    src: "/intro/transition-images/2.webp",
    x: "42%",
    y: "-56%",
    z: -300,
  },
  {
    src: "/intro/transition-images/3.webp",
    x: "79%",
    y: "13%",
    z: -460,
  },
  {
    src: "/intro/transition-images/4.webp",
    x: "-65%",
    y: "-92%",
    z: -600,
  },
  {
    src: "/intro/transition-images/5.webp",
    x: "100%",
    y: "87%",
    z: -700,
  },
  {
    src: "/intro/transition-images/6.webp",
    x: "-11%",
    y: "-100%",
    z: -900,
  },
  {
    src: "/intro/transition-images/7.webp",
    x: "56%",
    y: "61%",
    z: -1000,
  },
  {
    src: "/intro/transition-images/8.webp",
    x: "-77%",
    y: "92%",
    z: -1100,
  },
  {
    src: "/intro/transition-images/9.webp",
    x: "23%",
    y: "-73%",
    z: -1200,
  },
  {
    src: "/intro/transition-images/10.webp",
    x: "-100%",
    y: "0%",
    z: -1300,
  },
];

export default function Home() {
  const imgsRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const tlRef = useRef<GSAPTimeline | null>(null);

  useGSAP(() => {
    for (const [index, img] of imgsRef.current.entries()) {
      gsap.set(img, {
        translateX: introImages[index].x,
        translateY: introImages[index].y,
        translateZ: introImages[index].z,
        opacity: 0,
        filter: `blur(${Math.abs(introImages[index].z) / 100}px)`,
      });
    }

    const tl = gsap.timeline({ paused: true });
    for (const [index, img] of imgsRef.current.entries()) {
      tl.to(
        img,
        {
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.4,
          ease: "power4.in",
        },
        index * 0.08 + 0.2
      );

      tl.to(
        img,
        {
          translateZ: 300,
          ease: "power4.in",
          duration: 0.7,
        },
        index * 0.08
      );
    }

    tlRef.current = tl;
  }, []);

  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (state.phase === "introPlaying") {
        setTimeout(() => {
          tlRef.current?.play();
        }, 4400);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <section aria-labelledby="site-title" className="sr-only">
        <h1 id="site-title">松田秀隆のポートフォリオサイト</h1>
        <p>
          フロントエンド開発者の松田秀隆です。Web上のインタラクティブ表現や海外のアワード受賞サイトに触れ、同様の表現を自ら実装できるよう学習してきました。
          <br />
          Three.js・シェーダー（GLSL）を中心に、ブラウザ上のビジュアル表現を勉強中です。他にも貪欲に技術の幅を広げたいと思っています。
          <br />
          カーソル移動で顔の回転。顔の周りをカーソル移動すると、顔が笑顔になります。
          <br />
          名前の書かれた板か、「move to
          gallery」ボタンをクリックすると、作品ギャラリーへ遷移します。
        </p>
      </section>
      <div className="w-full h-screen overflow-hidden grid place-items-center">
        <div className="perspective-near transform-3d max-w-2xl w-3/4 grid place-items-center">
          {introImages.map((img, index) => (
            <figure
              key={index}
              className="w-full h-full relative col-span-1 col-start-1 row-span-1 row-start-1
            opacity-0"
              ref={createRefCallback(imgsRef, index)}
            >
              <Image
                src={img.src}
                alt={`cosm${index + 1}`}
                className="w-full h-full object-cover"
                width={762}
                height={500}
              />
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
