"use client";

/**
 * Rendered instead of <Scene /> when shouldUseLiteMode() is true.
 * Pure CSS gradient + a static skyline silhouette image, layered with
 * background-attachment for a cheap parallax feel at zero GPU cost.
 */
export default function LiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-obsidian">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 20%, rgba(201,161,90,0.16), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[70vh] opacity-40 bg-no-repeat bg-bottom bg-cover"
        style={{ backgroundImage: "url('/textures/skyline-silhouette.svg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian" />
    </div>
  );
}
