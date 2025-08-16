"use client";

import { useState, useEffect } from "react";

// Generate random greeting
const generateGreeting = (name: string) => {
  const greetings = [
    `Hi ${name}! How are you today?`,
    `Hello ${name}! What can I help you with?`,
    `Hey ${name}! Ready to get things done?`,
    `Welcome back, ${name}! How can I assist you?`,
    `Good to see you, ${name}! What's on your agenda?`,
    `Hi there, ${name}! How can I make your day better?`,
    `Hello ${name}! What would you like to work on?`,
    `Hey ${name}! Let's build something amazing together!`,
    `Welcome, ${name}! How can I help you today?`,
    `Hi ${name}! What brings you here today?`,
  ];

  const defaultGreetings = [
    "Hi, how are you?",
    "Hello! What can I help you with?",
    "Hey there! Ready to get things done?",
    "Welcome! How can I assist you?",
    "Good to see you! What's on your agenda?",
    "Hi! How can I make your day better?",
    "Hello! What would you like to work on?",
    "Hey! Let's build something amazing together!",
    "Welcome! How can I help you today?",
    "Hi there! What brings you here today?",
  ];

  const messages = name.trim() ? greetings : defaultGreetings;
  return messages[Math.floor(Math.random() * messages.length)];
};

export function WelcomeHeading() {
  const [greeting, setGreeting] = useState<string>("Welcome!");

  useEffect(() => {
    const personalName =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("personalName="))
        ?.split("=")[1] || "";

    setGreeting(generateGreeting(personalName));
  }, []);

  return (
    <h1 className="text-5xl font-normal text-foreground font-[family-name:var(--font-eb-garamond)]">
      {greeting}
    </h1>
  );
}
