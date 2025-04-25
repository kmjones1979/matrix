import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface TerminalProps {
  className?: string;
}

export const MatrixTerminal = ({ className = "" }: TerminalProps) => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();
  const [output, setOutput] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isWaiting, setIsWaiting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Terminal mode states
  const [commandMode, setCommandMode] = useState<"normal" | "passcode">("normal");

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

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Initialize terminal with system messages
  useEffect(() => {
    setOutput(["M4TR1X OS v1.0 - Secure Terminal", "Type 'help' for available commands", ""]);
  }, []);

  // Update terminal with user progress when it changes
  useEffect(() => {
    if (userProgress) {
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
  }, [userProgress]);

  // Handle command execution
  const executeCommand = async (cmd: string) => {
    // Add command to history
    setInputHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Check for "/debug" command
    if (cmd.trim().toLowerCase() === "/debug") {
      setOutput(prev => [...prev, `> ${cmd}`, "Navigating to debug interface...", ""]);
      // Use setTimeout to show the message before navigation
      setTimeout(() => router.push("/debug"), 1000);
      return;
    }

    // Split command and arguments
    const [command, ...args] = cmd.trim().toLowerCase().split(" ");

    // Handle different command modes
    if (commandMode === "passcode") {
      const cleanedPasscode = cmd.trim().toLowerCase();
      setOutput(prev => [...prev, `> ${cmd}`, "Attempting to validate passcode..."]);
      setIsWaiting(true);

      try {
        await solveLevel({
          functionName: "solveLevel",
          args: [cleanedPasscode],
        });
        setOutput(prev => [...prev, "Access granted!", ""]);
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

        setOutput(prev => [...prev, `Access denied: ${errorMsg}`, ""]);
      }

      setIsWaiting(false);
      setCommandMode("normal");
      return;
    }

    // Normal command mode - handle various commands
    switch (command) {
      case "help":
        setOutput(prev => [
          ...prev,
          `> ${cmd}`,
          "Available commands:",
          "  help      - Display this help menu",
          "  clear     - Clear terminal",
          "  status    - Display your current status",
          "  hack      - Attempt to hack the system (enter passcode)",
          "  secret    - Discover hidden easter eggs",
          "  bluepill  - Take the blue pill (reset progress)",
          "  about     - About the Matrix",
          "  debug-passcode - Debug passcode validation (admin only)",
          "",
        ]);
        break;

      case "clear":
        // Clear the terminal completely
        setOutput([]);
        break;

      case "status":
        if (!isConnected) {
          setOutput(prev => [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""]);
          break;
        }

        if (userProgress) {
          const [level, levelName, hint, hasRedPill] = userProgress;
          setOutput(prev => [
            ...prev,
            `> ${cmd}`,
            `User: ${connectedAddress}`,
            `Access Level: ${level}`,
            `Current Mission: ${levelName}`,
            `Hint: ${hint}`,
            hasRedPill ? "Red Pill Status: ACTIVE" : "Red Pill Status: INACTIVE",
            "",
          ]);
        } else {
          setOutput(prev => [...prev, `> ${cmd}`, "Unable to retrieve status. System may be offline.", ""]);
        }
        break;

      case "hack":
        if (!isConnected) {
          setOutput(prev => [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""]);
          break;
        }

        setOutput(prev => [...prev, `> ${cmd}`, "Enter passcode:"]);
        setCommandMode("passcode");
        break;

      case "secret":
        if (!isConnected) {
          setOutput(prev => [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""]);
          break;
        }

        if (!args.length) {
          setOutput(prev => [...prev, `> ${cmd}`, "Usage: secret <phrase>", ""]);
          break;
        }

        const secretPhrase = args.join(" ");
        setOutput(prev => [...prev, `> ${cmd} ${secretPhrase}`, "Searching for secret..."]);

        setIsWaiting(true);
        try {
          await discoverSecret({
            functionName: "discoverSecret",
            args: [secretPhrase],
          });
          setOutput(prev => [...prev, "Secret discovered! Reward sent to your wallet.", ""]);
        } catch (error: any) {
          setOutput(prev => [...prev, `Secret not found: ${error.message || "Invalid secret phrase"}`, ""]);
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
        setOutput(prev => [
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
        ]);
        break;

      case "debug-passcode":
        if (!isConnected) {
          setOutput(prev => [...prev, `> ${cmd}`, "Connect your wallet to access the Matrix", ""]);
          break;
        }

        if (!args.length) {
          setOutput(prev => [...prev, `> ${cmd}`, "Usage: debug-passcode <passcode>", ""]);
          break;
        }

        const testPasscode = args.join(" ").trim().toLowerCase();
        setOutput(prev => [
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
        ]);

        setIsWaiting(true);
        try {
          await solveLevel({
            functionName: "solveLevel",
            args: [testPasscode],
          });
          setOutput(prev => [...prev, "Success! Passcode is valid.", ""]);
        } catch (error: any) {
          console.error("Debug passcode error:", error);
          setOutput(prev => [
            ...prev,
            "Failed to validate passcode.",
            `Error: ${error.message || "Unknown error"}`,
            "",
          ]);
        }
        setIsWaiting(false);
        break;

      default:
        setOutput(prev => [
          ...prev,
          `> ${cmd}`,
          `Command not found: ${command}`,
          "Type 'help' for available commands",
          "",
        ]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isWaiting) return;

    executeCommand(inputValue);
    setInputValue("");
  };

  // Handle keyboard navigation through history
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(inputHistory[inputHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(inputHistory[inputHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue("");
      }
    }
  };

  return (
    <div
      className={`bg-black border-2 border-green-500 rounded-md overflow-hidden shadow-lg shadow-green-300/20 ${className}`}
    >
      <div className="bg-green-900/50 px-4 py-2 text-green-400 font-mono flex justify-between items-center">
        <div className="text-xs">M4TR1X://TERMINAL</div>
        <div className="text-xs">
          {isConnected
            ? `USER: ${connectedAddress?.substring(0, 6)}...${connectedAddress?.substring(38)}`
            : "NOT CONNECTED"}
        </div>
      </div>

      <div ref={terminalRef} className="bg-black p-4 h-[70vh] overflow-y-auto font-mono text-green-400 text-sm">
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="mt-2 flex items-center">
          <span className="mr-2">{commandMode === "normal" ? ">" : ">>"}</span>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isWaiting}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default MatrixTerminal;
