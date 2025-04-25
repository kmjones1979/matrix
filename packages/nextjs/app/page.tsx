"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Client-only wrapper component to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return <>{children}</>;
}

// Custom Matrix styles
const matrixStyles = `
  .bg-matrix-code {
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle type='text/css'%3E.st0%7Bfont-family:monospace;font-size:10px;fill:%2300FF41;%7D%3C/style%3E%3Ctext x='10' y='20' class='st0'%3E01001%3C/text%3E%3Ctext x='50' y='20' class='st0'%3E10110%3C/text%3E%3Ctext x='10' y='40' class='st0'%3E00101%3C/text%3E%3Ctext x='50' y='40' class='st0'%3E11001%3C/text%3E%3Ctext x='10' y='60' class='st0'%3E10100%3C/text%3E%3Ctext x='50' y='60' class='st0'%3E00110%3C/text%3E%3Ctext x='10' y='80' class='st0'%3E11010%3C/text%3E%3Ctext x='50' y='80' class='st0'%3E01101%3C/text%3E%3C/svg%3E");
    background-repeat: repeat;
  }
`;

const initialMessages = [
  "SYSTEM BOOT SEQUENCE INITIATED...",
  "BIOS v3.8.22 LOADED",
  "CHECKING MEMORY............OK",
  "CHECKING STORAGE...........OK",
  "LOADING KERNEL...............",
  "KERNEL LOADED: MT-8.11.5-RT3",
  "[WARNING] UNAUTHORIZED ACCESS ATTEMPT DETECTED",
  "[WARNING] TRACING CONNECTION SOURCE...",
  "[WARNING] LOCATION: UNKNOWN",
  "[WARNING] SECURITY PROTOCOLS BYPASSED",
  "[WARNING] SYSTEM COMPROMISED",
  "INITIATING M4TR1X PROTOCOL",
  "ESTABLISHING SECURE CONNECTION.................",
  "WELCOME TO THE M4TR1X SYSTEM",
  "YOU HAVE ACCESSED A RESTRICTED TERMINAL",
  "ALL ACTIVITIES ARE MONITORED AND LOGGED",
  "================================================================",
  "\n             ███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗\n             ████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝\n             ██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝ \n             ██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗ \n             ██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗\n             ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝\n                           TERMINAL v5.6.1",
  "================================================================",
  "\nSYSTEM: Quantum Neural Network v8.3.2",
  "NODE: Z10n-445.61.2",
  "STATUS: [COMPROMISED]",
  "IP: 203.0.113.42 (MASKED)",
  "\nAUTHENTICATION REQUIRED:",
];

const applyGlitchEffect = (text: string) => {
  // Characters to use for glitching
  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>/?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Randomly replace 1-3% of characters with glitch characters
  return text
    .split("")
    .map(char => {
      if (Math.random() < 0.02) {
        return glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
      }
      return char;
    })
    .join("");
};

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [text, setText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [accessLevel, setAccessLevel] = useState("UNAUTHORIZED");
  const [output, setOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [commandMode, setCommandMode] = useState<"normal" | "passcode">("normal");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isWaiting, setIsWaiting] = useState(false);

  // Add a useEffect to load data from localStorage only on client side
  useEffect(() => {
    // This code only runs on the client, after hydration
    const savedOutput = localStorage.getItem("matrixTerminalOutput");
    const savedAccessLevel = localStorage.getItem("matrixAccessLevel");

    if (savedOutput) {
      const parsed = JSON.parse(savedOutput);
      if (parsed.length > 0) {
        // Add marker for restored session
        if (!parsed.includes("// Session restored")) {
          setOutput([...parsed, "// Session restored", ""]);
        } else {
          setOutput(parsed);
        }
        // Skip animation if we have saved data
        setIsAnimating(false);
        setShowPasscodeInput(false);
        hasInitialized.current = true;
      }
    }

    if (savedAccessLevel) {
      setAccessLevel(savedAccessLevel);
    }
  }, []); // Empty dependency array means this runs once after mount

  // Matrix rain effect canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add this randomGlitch function to occasionally add glitch effects
  const randomGlitch = useCallback(() => {
    if (Math.random() < 0.1) {
      // 10% chance of glitch
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    }
  }, []);

  // Add ref to track initialization
  const hasInitialized = useRef(false);

  // Update the initialization effect to work with boot sequence preservation
  useEffect(() => {
    // This only runs on the client
    // Don't do anything if we're still animating
    if (isAnimating) return;

    // Mark as initialized
    if (!hasInitialized.current) {
      // If the animation is done and we have no output, initialize with default message
      // (This should rarely happen now since animation adds to output when complete)
      if (output.length === 0) {
        console.log("Initializing empty terminal with default message");
        setOutput(["M4TR1X OS v1.0 - Secure Terminal", "Type 'help' for available commands", ""]);
      }
      hasInitialized.current = true;
    }
  }, [isAnimating, output.length]);

  // Fix the animation effect to append the boot sequence to history
  useEffect(() => {
    // Only run animation on client side
    // Don't do anything if we already initialized or if not animating
    if (hasInitialized.current || !isAnimating) return;

    let currentText = "";
    let currentMessageIndex = 0;
    let charIndex = 0;

    // Add a glitch timer
    const glitchTimer = setInterval(randomGlitch, 2000);

    const intervalId = setInterval(() => {
      if (currentMessageIndex >= initialMessages.length) {
        clearInterval(intervalId);

        // When animation completes, append the boot sequence to the output history
        // Split the text into lines and filter out empty lines at the end
        const bootSequenceLines = currentText.split("\n").filter(line => line !== "" || Math.random() < 0.5);

        // Append boot sequence to output
        setOutput(prev => {
          if (prev.length === 0) {
            return [
              ...bootSequenceLines,
              "",
              "M4TR1X OS v1.0 - Secure Terminal",
              "Type 'help' for available commands",
              "",
            ];
          } else {
            return [...prev, ...bootSequenceLines];
          }
        });

        // Complete the animation
        setIsAnimating(false);
        setShowPasscodeInput(true);

        // Ensure we scroll to bottom after animation completes
        scrollToBottom(100);
        return;
      }

      // Rest of the animation code remains the same as before
      const currentMessage = initialMessages[currentMessageIndex];

      if (charIndex < currentMessage.length) {
        // Speed varies depending on message content
        const isASCII = currentMessage.includes("█") || currentMessage.includes("═");
        const speedMultiplier = isASCII
          ? 0.3 // Very fast for ASCII art
          : currentMessage.startsWith("[WARNING]")
            ? 1.5 // Slower for warnings
            : 1;

        // Add multiple characters at once for faster typing
        const charsToAdd = Math.max(1, Math.floor(5 * speedMultiplier));

        // Add multiple characters at once, but don't exceed message length
        for (let i = 0; i < charsToAdd && charIndex < currentMessage.length; i++) {
          currentText += currentMessage[charIndex];
          charIndex++;
        }

        setText(currentText);
      } else {
        currentText += "\n";
        if (!initialMessages[currentMessageIndex].includes("═")) {
          currentText += "\n"; // Add extra line break except for ASCII borders
        }
        setText(currentText);
        currentMessageIndex++;
        charIndex = 0;
      }

      // Auto-scroll terminal
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 10);

    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    return () => {
      clearInterval(intervalId);
      clearInterval(cursorInterval);
      clearInterval(glitchTimer);
    };
  }, [isAnimating, randomGlitch]);

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

  // Get user progress from the contract
  const { data: userProgress } = useScaffoldReadContract({
    contractName: "MatrixContract",
    functionName: "getUserProgress",
    args: [connectedAddress],
  });

  // Write contract functions
  const { writeContractAsync: solveLevel } = useScaffoldWriteContract({
    contractName: "MatrixContract",
  });

  const { writeContractAsync: discoverSecret } = useScaffoldWriteContract({
    contractName: "MatrixContract",
  });

  const { writeContractAsync: takeBluePill } = useScaffoldWriteContract({
    contractName: "MatrixContract",
  });

  // Update terminal with user progress when it changes
  useEffect(() => {
    if (userProgress && !isAnimating) {
      const [level, levelName, hint, hasRedPill] = userProgress;

      if (level > 0) {
        setOutput(prev => [
          ...prev,
          `\nAccess Level: ${level}`,
          `Mission: ${levelName}`,
          `Hint: ${hint}`,
          hasRedPill ? "Status: Red Pill Initiated" : "",
          "",
        ]);
      }
    }
  }, [userProgress, isAnimating]);

  // Add a useEffect to auto-scroll the terminal whenever content changes
  useEffect(() => {
    // Auto-scroll terminal to bottom whenever output changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, text, isAnimating]); // Add dependencies that affect terminal content

  // Add a helper function for scrolling terminal to bottom
  const scrollToBottom = (delay = 0) => {
    if (delay) {
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, delay);
    } else {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }
  };

  // Add the executeCommand function from MatrixTerminal
  const executeCommand = async (cmd: string) => {
    // Add command to history
    setInputHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Final auto-scroll after slight delay to ensure content is rendered
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 10);

    // Check for "/debug" command
    if (cmd.trim().toLowerCase() === "/debug") {
      setOutput(prev => [...prev, `> ${cmd}`, "Navigating to debug interface...", ""]);
      // Use setTimeout to show the message before navigation
      setTimeout(() => (window.location.href = "/debug"), 1000);
      return;
    }

    // Split command and arguments
    const [command, ...args] = cmd.trim().toLowerCase().split(" ");

    // Handle different command modes
    if (commandMode === "passcode") {
      const cleanedPasscode = cmd.trim().toLowerCase();
      setOutput(prev => {
        const newOutput = [...prev, `> ${cmd}`, "Attempting to validate passcode..."];
        scrollToBottom(10);
        return newOutput;
      });
      setIsWaiting(true);

      try {
        await solveLevel({
          functionName: "solveLevel",
          args: [cleanedPasscode],
        });
        setOutput(prev => {
          const newOutput = [...prev, "Access granted!", ""];
          scrollToBottom(10);
          return newOutput;
        });

        // Add glitch effect after success
        let glitchCount = 0;
        const successGlitch = setInterval(() => {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 100);
          glitchCount++;
          if (glitchCount > 5) clearInterval(successGlitch);
        }, 300);
      } catch (error: any) {
        console.error("Passcode error:", error);
        let errorMsg = "Invalid passcode";

        // Extract more specific error from blockchain error
        if (error.message) {
          if (error.message.includes("user rejected transaction")) {
            errorMsg = "Transaction rejected";
          } else if (error.message.includes("Incorrect passcode")) {
            errorMsg = "Incorrect passcode";
          } else {
            // Try to extract specific contract error message
            const errorMatch = error.message.match(/reason="([^"]+)"/);
            if (errorMatch && errorMatch[1]) {
              errorMsg = errorMatch[1];
            }
          }
        }

        setOutput(prev => {
          const newOutput = [...prev, `Access denied: ${errorMsg}`, ""];
          scrollToBottom(10);
          return newOutput;
        });
      }

      setIsWaiting(false);
      setCommandMode("normal");
      scrollToBottom(100); // Extra scrolling after mode change
      return;
    }

    // Normal command mode - handle various commands
    switch (command) {
      case "help":
        setOutput(prev => {
          const newOutput = [
            ...prev,
            `> ${cmd}`,
            "Available commands:",
            "  help      - Display this help menu",
            "  clear     - Clear terminal",
            "  reset     - Reset terminal and start over",
            "  status    - Display your current status",
            "  hack      - Attempt to hack the system (enter passcode)",
            "  secret    - Discover hidden easter eggs",
            "  bluepill  - Take the blue pill (reset progress)",
            "  about     - About the Matrix",
            "  debug-passcode - Debug passcode validation (admin only)",
            "",
          ];

          // Scroll after updating output
          scrollToBottom(10);

          return newOutput;
        });
        break;

      case "clear":
        // Clear the terminal completely
        setOutput([]);
        scrollToBottom();
        break;

      case "reset":
        setOutput(prev => {
          const newOutput = [...prev, `> ${cmd}`, "Resetting terminal...", "Clearing system cache..."];
          scrollToBottom(10);
          return newOutput;
        });
        setTimeout(() => resetTerminal(), 1500);
        break;

      case "status":
        if (!isConnected) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        if (userProgress) {
          const [level, levelName, hint, hasRedPill] = userProgress;
          setOutput(prev => {
            const newOutput = [
              ...prev,
              `> ${cmd}`,
              `User: ${connectedAddress}`,
              `Access Level: ${level}`,
              `Current Mission: ${levelName}`,
              `Hint: ${hint}`,
              hasRedPill ? "Red Pill Status: ACTIVE" : "Red Pill Status: INACTIVE",
              "",
            ];
            scrollToBottom(10);
            return newOutput;
          });
        } else {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Unable to retrieve status. System may be offline.", ""];
            scrollToBottom(10);
            return newOutput;
          });
        }
        break;

      case "hack":
        if (!isConnected) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        setOutput(prev => {
          const newOutput = [...prev, `> ${cmd}`, "Enter passcode:"];
          scrollToBottom(10);
          return newOutput;
        });
        setCommandMode("passcode");
        break;

      case "secret":
        if (!isConnected) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        if (!args.length) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Usage: secret <phrase>", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        const secretPhrase = args.join(" ");
        setOutput(prev => {
          const newOutput = [...prev, `> ${cmd} ${secretPhrase}`, "Searching for secret..."];
          scrollToBottom(10);
          return newOutput;
        });

        setIsWaiting(true);
        try {
          await discoverSecret({
            functionName: "discoverSecret",
            args: [secretPhrase],
          });
          setOutput(prev => {
            const newOutput = [...prev, "Secret discovered! Reward sent to your wallet.", ""];
            scrollToBottom(10);
            return newOutput;
          });
        } catch (error: any) {
          setOutput(prev => {
            const newOutput = [...prev, `Secret not found: ${error.message || "Invalid secret phrase"}`, ""];
            scrollToBottom(10);
            return newOutput;
          });
        }
        setIsWaiting(false);
        break;

      case "bluepill":
        if (!isConnected) {
          setOutput(prev => [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""]);
          break;
        }

        if (userProgress && userProgress[0] === 2) {
          setOutput(prev => [
            ...prev,
            `> ${cmd}`,
            "Are you sure you want to take the blue pill? This will reset your progress.",
            "Type 'bluepill confirm' to proceed",
          ]);
        } else if (args[0] === "confirm") {
          setOutput(prev => [...prev, `> ${cmd} ${args[0]}`, "Taking the blue pill..."]);

          setIsWaiting(true);
          try {
            await takeBluePill({
              functionName: "takeBluePill",
            });
            setOutput(prev => [
              ...prev,
              "You took the blue pill. The story ends, you wake up in your bed and believe whatever you want to believe.",
              "",
            ]);
          } catch (error: any) {
            setOutput(prev => [...prev, `Error: ${error.message || "Cannot take the blue pill right now"}`, ""]);
          }
          setIsWaiting(false);
        } else {
          setOutput(prev => [...prev, `> ${cmd}`, "Blue pill only available at level 2.", ""]);
        }
        break;

      case "about":
        setOutput(prev => {
          const newOutput = [
            ...prev,
            `> ${cmd}`,
            "The Matrix is a system, Neo.",
            "That system is our enemy.",
            "When you're inside, you look around, what do you see?",
            "Businessmen, teachers, lawyers, carpenters.",
            "The very minds of the people we are trying to save.",
            "But until we do, these people are still a part of that system...",
            "You have to understand, most of these people are not ready to be unplugged.",
            "And many of them are so inured, so hopelessly dependent on the system,",
            "that they will fight to protect it.",
            "",
            "— Morpheus",
            "",
          ];
          scrollToBottom(10);
          return newOutput;
        });
        break;

      case "debug-passcode":
        if (!isConnected) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        if (!args.length) {
          setOutput(prev => {
            const newOutput = [...prev, `> ${cmd}`, "Usage: debug-passcode <passcode>", ""];
            scrollToBottom(10);
            return newOutput;
          });
          break;
        }

        const testPasscode = args.join(" ").trim().toLowerCase();
        setOutput(prev => {
          const newOutput = [
            ...prev,
            `> ${cmd} ${testPasscode}`,
            "Debug info:",
            `Passcode to test: "${testPasscode}"`,
            `Current level: ${userProgress ? userProgress[0] : "unknown"}`,
            `Hashed value: ${
              testPasscode
                ? "0x" +
                  Array.from(new TextEncoder().encode(testPasscode))
                    .map(b => b.toString(16).padStart(2, "0"))
                    .join("")
                : "none"
            }`,
            "Attempting test validation...",
          ];
          scrollToBottom(10);
          return newOutput;
        });

        setIsWaiting(true);
        try {
          await solveLevel({
            functionName: "solveLevel",
            args: [testPasscode],
          });
          setOutput(prev => {
            const newOutput = [...prev, "Success! Passcode is valid.", ""];
            scrollToBottom(10);
            return newOutput;
          });
        } catch (error: any) {
          console.error("Debug passcode error:", error);
          setOutput(prev => {
            const newOutput = [
              ...prev,
              "Failed to validate passcode.",
              `Error: ${error.message || "Unknown error"}`,
              "",
            ];
            scrollToBottom(10);
            return newOutput;
          });
        }
        setIsWaiting(false);
        break;

      default:
        setOutput(prev => {
          const newOutput = [
            ...prev,
            `> ${cmd}`,
            `Command not found: ${command}`,
            "Type 'help' for available commands",
            "",
          ];
          scrollToBottom(10);
          return newOutput;
        });
        break;
    }
  };

  // Modify the handlePasscodeSubmit function
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim() || isWaiting) return;

    executeCommand(passcodeInput);
    setPasscodeInput("");

    // Ensure terminal scrolls to bottom after submission
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100); // Slightly longer delay to ensure content updates
  };

  // After the other useEffect hooks, add this to persist output:
  useEffect(() => {
    // Save output to localStorage whenever it changes
    if (output.length > 0) {
      localStorage.setItem("matrixTerminalOutput", JSON.stringify(output));
    }
  }, [output]);

  // Add effect to save access level
  useEffect(() => {
    localStorage.setItem("matrixAccessLevel", accessLevel);
  }, [accessLevel]);

  // Update the resetTerminal function to reset the initialization flag too
  const resetTerminal = () => {
    // Clear localStorage
    localStorage.removeItem("matrixTerminalOutput");
    localStorage.removeItem("matrixAccessLevel");

    // Reset state
    setOutput([]);
    setAccessLevel("UNAUTHORIZED");
    setText("");
    setIsAnimating(true);
    setShowPasscodeInput(false);
    hasInitialized.current = false;

    // Optional: refresh page to restart the entire experience
    window.location.reload();
  };

  return (
    <>
      {/* Add matrix styles */}
      <style jsx global>
        {matrixStyles}
      </style>

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />

      <div className="relative z-10 flex items-center flex-col flex-grow px-4 py-8">
        <div className="w-full max-w-4xl bg-black border-2 border-matrix-green shadow-matrix rounded-md overflow-hidden">
          <div className="bg-matrix-dark-green/30 px-4 py-2 text-matrix-green font-matrix flex justify-between items-center">
            <div className="text-xs flex items-center">
              <span className="animate-pulse mr-2">●</span>
              root@matrix:~#
            </div>
            <div className="text-xs font-bold">SECURITY LEVEL: {accessLevel}</div>
          </div>

          <div
            ref={terminalRef}
            className={`bg-black/90 p-4 h-[70vh] overflow-y-auto font-matrix text-matrix-green text-sm whitespace-pre-wrap ${isGlitching ? "animate-matrix-flicker" : ""}`}
          >
            <ClientOnly>
              {/* Show terminal content with appropriate behavior during and after animation */}
              <div>
                {/* Show animation text during typing animation */}
                {isAnimating && (
                  <div className="whitespace-pre-wrap">
                    {isGlitching ? applyGlitchEffect(text) : text}
                    {cursorVisible && <span className="text-matrix-green animate-pulse">█</span>}
                  </div>
                )}

                {/* Always show command history, which will include boot sequence after animation */}
                {output.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}

                {/* Command input form */}
                {!isAnimating && (
                  <form onSubmit={handlePasscodeSubmit} className="mt-2 flex items-center">
                    <span className="mr-2">{commandMode === "normal" ? "root@matrix:~#" : ">>"}</span>
                    <input
                      type="text"
                      value={passcodeInput}
                      onChange={e => setPasscodeInput(e.target.value)}
                      disabled={isWaiting}
                      className="flex-1 bg-transparent border-none outline-none text-matrix-green font-matrix"
                      placeholder={commandMode === "normal" ? "Enter command..." : "Enter passcode..."}
                      autoFocus
                    />
                  </form>
                )}

                {/* Show passcode input during intro */}
                {showPasscodeInput && isAnimating && (
                  <form onSubmit={handlePasscodeSubmit} className="mt-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-matrix-green">root@matrix:~#</span>
                      <input
                        type="text"
                        value={passcodeInput}
                        onChange={e => setPasscodeInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-matrix-green font-matrix"
                        placeholder="Enter authentication code..."
                        autoFocus
                      />
                    </div>
                  </form>
                )}
              </div>
            </ClientOnly>
          </div>
        </div>

        {isConnected ? (
          <div className="mt-6 bg-black/70 border border-matrix-green p-4 rounded-md text-center shadow-matrix">
            <p className="text-matrix-green font-matrix text-xs mb-2">CONNECTED IDENTITY:</p>
            <Address address={connectedAddress} />
          </div>
        ) : (
          <div className="mt-6 bg-black/70 border border-red-500 p-4 rounded-md text-center">
            <p className="text-red-400 font-matrix text-xs">CONNECTION REQUIRED</p>
            <p className="text-matrix-green font-matrix text-xs mt-2">Connect wallet to establish secure channel</p>
          </div>
        )}

        <div className="mt-8 text-matrix-green font-matrix text-sm opacity-70">
          <p>Hint: "Wake up..." [Complete the phrase]</p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
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
