import { useEffect, useRef } from "react";

export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters (optional: could use binary, but this is more authentic to the movie)
    const chars =
      "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:;=?+*()[]{}";

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to store the current y position of each column
    const drops: number[] = [];

    // Initialize all columns to start at a random y position
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor((Math.random() * canvas.height) / fontSize) * -1;
    }

    // Drawing the matrix rain
    const draw = () => {
      // Fill the entire canvas with semi-transparent black
      // This creates the fading trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set font properties
      ctx.font = `${fontSize}px monospace`;

      // Loop through each column
      for (let i = 0; i < columns; i++) {
        // Generate a random character
        const charIndex = Math.floor(Math.random() * chars.length);
        const text = chars[charIndex];

        // Set varying brightness for matrix characters
        const brightness = Math.random() * 0.5 + 0.5; // 0.5 to 1

        // Leader characters (heads) are brighter white-green
        if (drops[i] > 0 && Math.random() > 0.975) {
          ctx.fillStyle = `rgba(180, 255, 180, ${brightness})`;
        } else {
          // Trailing characters are darker green
          ctx.fillStyle = `rgba(0, ${Math.floor(255 * brightness)}, 65, ${brightness})`;
        }

        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Move the drop down after drawing
        drops[i]++;

        // Random chance to reset position when drop goes off screen
        // or randomly reset some drops for a more varied effect
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Small chance to randomly reset drops that aren't yet at the bottom
        if (Math.random() > 0.99) {
          drops[i] = 0;
        }
      }
    };

    // Animation loop
    const interval = setInterval(draw, 33); // ~30fps

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Recalculate columns
      const newColumns = Math.floor(canvas.width / fontSize);

      // Reset drops array with new size
      if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) {
          drops[i] = Math.floor((Math.random() * canvas.height) / fontSize) * -1;
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" style={{ background: "#000" }} />;
};

export default MatrixRain;
