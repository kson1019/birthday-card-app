const invitationCardCompetitiveAnalysis = {
  objective:
    "Compare invitation card app competitors to identify UX, feature, and monetization gaps.",
  competitors: [
    {
      name: "Canva",
      strengths: [
        "Large template library",
        "Strong mobile editing experience",
        "Collaborative design workflows",
      ],
      weaknesses: [
        "Less event-specific RSVP flow",
        "Some premium assets locked behind paywall",
      ],
      opportunitiesForUs: [
        "Faster RSVP-first creation flow",
        "Purpose-built birthday invitation templates",
      ],
    },
    {
      name: "Evite",
      strengths: ["Built-in RSVP tracking", "Event reminder workflow"],
      weaknesses: [
        "Template customization is more limited",
        "UI can feel dated compared to modern design tools",
      ],
      opportunitiesForUs: [
        "More visual customization with simple RSVP handling",
        "Cleaner, mobile-first card viewing experience",
      ],
    },
    {
      name: "Paperless Post",
      strengths: ["Premium design quality", "Strong invitation branding"],
      weaknesses: ["Heavier monetization friction", "Can feel expensive for casual events"],
      opportunitiesForUs: [
        "Affordable freemium model",
        "Fun animation and lightweight card experience",
      ],
    },
  ],
  featureChecklist: [
    "Card creation speed (< 3 minutes)",
    "Mobile readability",
    "Image quality and loading performance",
    "One-tap RSVP response",
    "Location deep-link to maps",
    "Dashboard status visibility",
    "Email deliverability reliability",
  ],
  nextActions: [
    "Benchmark time-to-create across competitors",
    "Collect user feedback on invitation readability on phone",
    "Prioritize quick wins for RSVP conversion",
  ],
};

export default invitationCardCompetitiveAnalysis;
