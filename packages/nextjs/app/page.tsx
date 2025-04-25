"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [text, setText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [accessLevel, setAccessLevel] = useState("UNAUTHORIZED");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);

  // Matrix rain effect canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial terminal message sequence
  const initialMessages = [
    "Initializing system...",
    "Establishing secure connection...",
    "WARNING: Unauthorized access detected!",
    "Tracing connection...",
    "Connection secure. Origin masked.",
    "Welcome to the M4TR1X terminal interface.",
    "ALERT: System is being monitored.",
    "To proceed, you must authenticate.",
  ];

  // Text animation effect
  useEffect(() => {
    if (!isAnimating) return;

    let currentText = "";
    let currentMessageIndex = 0;
    let charIndex = 0;

    const intervalId = setInterval(() => {
      if (currentMessageIndex >= initialMessages.length) {
        clearInterval(intervalId);
        setIsAnimating(false);
        setShowPasscodeInput(true);
        return;
      }

      const currentMessage = initialMessages[currentMessageIndex];

      if (charIndex < currentMessage.length) {
        currentText += currentMessage[charIndex];
        setText(currentText);
        charIndex++;
      } else {
        currentText += "\n\n";
        setText(currentText);
        currentMessageIndex++;
        charIndex = 0;
      }

      // Auto-scroll terminal
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 40); // typing speed

    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    return () => {
      clearInterval(intervalId);
      clearInterval(cursorInterval);
    };
  }, [isAnimating]);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const matrix = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00FF41";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(matrix, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle passcode input
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.toLowerCase() === "wake_up") {
      setAccessLevel("LEVEL 1");
      setText(
        prev =>
          prev +
          "\n\nAccess granted. Welcome to level 1.\n\n" +
          "Follow the white rabbit...\n\n" +
          "Try /debug to explore deeper.",
      );
    } else {
      setText(prev => prev + "\n\nAccess denied. Try again.");
    }
    setPasscodeInput("");
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />

      <div className="relative z-10 flex items-center flex-col flex-grow px-4 py-8">
        <div className="w-full max-w-4xl bg-black border-2 border-green-500 shadow-lg shadow-green-300/20 rounded-lg overflow-hidden">
          <div className="bg-green-900/50 px-4 py-2 text-green-400 font-mono flex justify-between items-center">
            <div className="text-xs">M4TR1X://TERMINAL</div>
            <div className="text-xs">ACCESS LEVEL: {accessLevel}</div>
          </div>

          <div ref={terminalRef} className="bg-black/90 p-4 h-[60vh] overflow-y-auto font-mono text-green-400 text-sm">
            {text}
            {cursorVisible && !showPasscodeInput && <span className="text-green-400">_</span>}

            {showPasscodeInput && (
              <form onSubmit={handlePasscodeSubmit} className="mt-4">
                <div className="flex items-center">
                  <span className="mr-2">{">"}</span>
                  <input
                    type="text"
                    value={passcodeInput}
                    onChange={e => setPasscodeInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                    placeholder="Enter passcode..."
                    autoFocus
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        {isConnected ? (
          <div className="mt-6 bg-black/70 border border-green-500 p-4 rounded-md text-center">
            <p className="text-green-400 font-mono text-xs mb-2">CONNECTED IDENTITY:</p>
            <Address address={connectedAddress} />
          </div>
        ) : (
          <div className="mt-6 bg-black/70 border border-green-500 p-4 rounded-md text-center">
            <p className="text-red-400 font-mono text-xs">CONNECTION REQUIRED</p>
            <p className="text-green-400 font-mono text-xs mt-2">Connect wallet to proceed with authentication</p>
          </div>
        )}

        <div className="mt-8 text-green-400 font-mono text-sm opacity-70">
          <p>Hint: The most famous line that starts everything...</p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link href="/matrix" passHref className="block">
            <div className="bg-black/70 border border-green-500 p-6 rounded-md hover:bg-green-900/20 transition-colors">
              <h3 className="text-green-400 font-mono text-lg mb-2">// ENTER MATRIX</h3>
              <p className="text-green-300/70 font-mono text-sm">Access the full Matrix terminal and game interface</p>
            </div>
          </Link>

          <Link href="/debug" passHref className="block">
            <div className="bg-black/70 border border-green-500 p-6 rounded-md hover:bg-green-900/20 transition-colors">
              <h3 className="text-green-400 font-mono text-lg mb-2">// DEBUG MODULE</h3>
              <p className="text-green-300/70 font-mono text-sm">
                Access system parameters and interact with core functions
              </p>
            </div>
          </Link>

          <Link href="/blockexplorer" passHref className="block">
            <div className="bg-black/70 border border-green-500 p-6 rounded-md hover:bg-green-900/20 transition-colors">
              <h3 className="text-green-400 font-mono text-lg mb-2">// DATA EXPLORER</h3>
              <p className="text-green-300/70 font-mono text-sm">Analyze blockchain records and transaction history</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
