interface Props {
  dayNumber: number;
  color: string;
  dimmed?: boolean;
  index?: number; // 1-based position within the day
}

export default function MapPin({ dayNumber, color, dimmed = false, index }: Props) {
  const bg = dimmed ? "#d4d4d4" : color;

  return (
    <div
      style={{
        width: 32,
        height: 32,
        backgroundColor: bg,
        opacity: dimmed ? 0.5 : 1,
        transition: "all 0.2s ease",
        border: "2.5px solid white",
        boxShadow: dimmed ? "0 1px 3px rgba(0,0,0,0.2)" : "0 2px 6px rgba(0,0,0,0.35)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {index != null ? index : `D${dayNumber}`}
      </span>
      {/* Downward pointer */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `7px solid ${bg}`,
        }}
      />
    </div>
  );
}
