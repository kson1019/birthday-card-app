interface CardFrontProps {
  imagePath: string;
  headline: string;
}

export default function CardFront({ imagePath, headline }: CardFrontProps) {
  return (
    <div className="relative w-full h-full">
      {/* Background Image */}
      <img
        src={imagePath}
        alt={headline}
        className="w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Decorative sparkles */}
      <div className="absolute top-6 left-6 animate-pulse">
        <span className="text-3xl">&#10022;</span>
      </div>
      <div className="absolute top-10 right-8 animate-pulse delay-300">
        <span className="text-2xl text-yellow-300">&#10022;</span>
      </div>
      <div className="absolute top-20 left-16 animate-pulse delay-700">
        <span className="text-xl text-pink-300">&#10022;</span>
      </div>

      {/* Headline */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center animate-float drop-shadow-lg">
          {headline}
        </h2>
        <p className="text-white/70 text-center text-sm mt-2">
          Tap to see details &#8594;
        </p>
      </div>
    </div>
  );
}
