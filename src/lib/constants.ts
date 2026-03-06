// RSVP Confirmation Messages

export const RSVP_MESSAGES = {
    accepted: [
      "Woohoo! The party just got 100% more awesome! 🎉",
      "You're in! Start stretching those dancing shoes! 💃",
      "Yay! We'll save you the best slice of cake! 🎂",
      "Party mode: ACTIVATED! See you there! 🚀",
      "You're officially on the VIP list! Get ready to celebrate! ⭐",
      "High five! This party wouldn't be the same without you! 🙌",
      "Let's gooo! The confetti cannon is now on standby! 🎊",
      "Boom! You just made the birthday kid's day! 🥳",
    ],
    declined: [
      "Aww, we'll miss you! We'll eat extra cake in your honor. 🍰",
      "No worries! We'll send you virtual confetti anyway. ✨",
      "The party will have a you-shaped hole in it. We'll manage somehow! 💙",
      "Sad party noises... but we totally understand! 🎈",
      "That's okay! We'll wave at your empty chair all night. 👋",
      "No problem! We'll blow out a candle for you (just one though). 🕯️",
      "We get it! Life happens. You'll be there in spirit! 💫",
      "Bummer! But hey, next time for sure! 🤞",
    ],
  };
  
  export function getRandomRsvpMessage(status: "accepted" | "declined"): string {
    const messages = RSVP_MESSAGES[status];
    return messages[Math.floor(Math.random() * messages.length)];
  }