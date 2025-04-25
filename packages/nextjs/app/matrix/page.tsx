"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { MatrixRain } from "~~/components/matrix/MatrixRain";
import { MatrixTerminal } from "~~/components/matrix/MatrixTerminal";

const MatrixPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    // Show terminal after a brief loading period for dramatic effect
    const timer = setTimeout(() => {
      setShowTerminal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Background Matrix Rain Effect */}
      <div className="fixed inset-0 w-full h-full z-0">
        <MatrixRain />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {!showTerminal ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-green-500 font-mono text-xl animate-pulse">Establishing secure connection...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Terminal Component */}
              <MatrixTerminal className="mb-8" />

              <div className="bg-black border-2 border-green-500 p-6 rounded-md shadow-lg shadow-green-300/20">
                <h1 className="text-green-400 font-mono text-2xl mb-6">THE MATRIX</h1>

                <p className="text-green-400 font-mono mb-4">
                  Welcome to the Matrix. This system is designed to test your ability to navigate through multiple
                  layers of security.
                </p>

                <p className="text-green-400 font-mono mb-4">
                  Use the terminal to interact with the system. Type 'help' to see available commands.
                </p>

                <div className="bg-black/70 border border-green-500 p-4 rounded-md text-green-400 font-mono text-sm mb-4">
                  <p className="text-red-400 mb-2">// WARNING:</p>
                  <p>All interactions with this terminal are recorded on the blockchain.</p>
                  <p>Proceed with caution. The system is watching.</p>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Link href="/debug" passHref>
                    <button className="bg-transparent hover:bg-green-900/30 text-green-500 font-mono py-2 px-4 border border-green-500 rounded transition-colors">
                      Debug Contract
                    </button>
                  </Link>
                  <Link href="/" passHref>
                    <button className="bg-transparent hover:bg-green-900/30 text-green-500 font-mono py-2 px-4 border border-green-500 rounded transition-colors">
                      ↩ Return
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-black border-2 border-green-500 p-6 rounded-md shadow-lg shadow-green-300/20">
                <h2 className="text-green-400 font-mono text-xl mb-4">Connection Status</h2>

                {isConnected ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 font-mono">CONNECTED</span>
                    </div>
                    <p className="text-green-400 font-mono text-sm">
                      Identity: {connectedAddress?.substring(0, 6)}...{connectedAddress?.substring(38)}
                    </p>
                    <p className="text-green-400 font-mono text-sm mt-2">Security Level: ENCRYPTED</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-red-400 font-mono">DISCONNECTED</span>
                    </div>
                    <p className="text-green-400 font-mono text-sm">Connect wallet to access the Matrix</p>
                  </div>
                )}

                <div className="mt-8">
                  <h2 className="text-green-400 font-mono text-xl mb-4">System Notes</h2>
                  <ul className="text-green-400 font-mono text-sm space-y-2">
                    <li>• Find the white rabbit</li>
                    <li>• The choice between red and blue</li>
                    <li>• There is no spoon</li>
                    <li>• Free your mind</li>
                  </ul>
                </div>

                <div className="mt-8">
                  <h2 className="text-green-400 font-mono text-xl mb-4">Passcode Hints</h2>
                  <div className="text-green-400 font-mono text-sm">
                    <p className="mb-2">Level 1: The most famous line that starts everything</p>
                    <p className="mb-2">Level 2: What Neo must follow</p>
                    <p className="mb-2">Level 3: The choice that cannot be explained</p>
                    <p className="mb-2">Level 4: Neo's reaction after his training</p>
                    <p>Level 5: The lesson about bending reality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixPage;
