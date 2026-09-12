const QUESTION_BANKS = {
  Math: [
    {
  id: 1,
  chapter: "Algebra",
  difficulty: "Easy",
  q: "If 3x + 7 = 22, what is the value of x?",
  options: ["3", "5", "7", "15"],
  answer: 1,
  explanation: "Subtract 7 from both sides to get 3x = 15. Divide both sides by 3 to get x = 5."
},
    {
  id: 2,
  chapter: "Geometry",
  difficulty: "Easy",
  q: "A circle has a radius of 4. What is its area, in terms of π?",
  options: ["8π", "16π", "4π", "12π"],
  answer: 1,
  explanation: "The area of a circle is πr². Here r = 4, so the area is π × 4² = 16π."
},
    {
  id: 3,
  chapter: "Algebra",
  difficulty: "Easy",
  q: "Solve for y: 2y - 4 = 3y - 9",
  options: ["5", "-5", "13", "1"],
  answer: 0,
  explanation: "Subtract 2y from both sides to get -4 = y - 9. Add 9 to both sides to find y = 5."
},
    {
  id: 4,
  chapter: "Percentages",
  difficulty: "Easy",
  q: "What is 15% of 240?",
  options: ["24", "36", "32", "40"],
  answer: 1,
  explanation: "15% means 15/100. So, 0.15 × 240 = 36."
},
    {
  id: 5,
  chapter: "Functions",
  difficulty: "Medium",
  q: "If f(x) = 2x² - 3, what is f(-2)?",
  options: ["5", "1", "-5", "11"],
  answer: 0,
  explanation: "Substitute x = -2. Since (-2)² = 4, f(-2) = 2 × 4 - 3 = 8 - 3 = 5."
},      { q: "The slope of the line 4x - 2y = 8 is:", options: ["2", "-2", "4", "0.5"], answer: 0 },
    { q: "What is the value of √144 + √25?", options: ["17", "19", "13", "22"], answer: 0 },
  ],
  Reading: [
    { q: "Which word best replaces 'ubiquitous' in a sentence about smartphones?", options: ["Rare", "Expensive", "Everywhere", "Fragile"], answer: 2 },
    { q: "The author's tone in the passage can best be described as:", options: ["Indifferent", "Reverent", "Hostile", "Comedic"], answer: 1 },
    { q: "A passage that moves from a specific example to a general claim uses which structure?", options: ["Deductive", "Inductive", "Circular", "Chronological"], answer: 1 },
    { q: "Which best describes an 'unreliable narrator'?", options: ["A narrator who lies to the reader on purpose or by mistake", "A narrator who speaks in first person", "A narrator who is a minor character", "A narrator who never appears"], answer: 0 },
    { q: "'The city was a living organism' is an example of:", options: ["Simile", "Metaphor", "Hyperbole", "Irony"], answer: 1 },
    { q: "A rhetorical question is used mainly to:", options: ["Request information", "Emphasize a point without expecting an answer", "Confuse the reader", "End a paragraph"], answer: 1 },
  ],
  Science: [
    { q: "What is the powerhouse of the cell?", options: ["Ribosome", "Nucleus", "Mitochondria", "Golgi body"], answer: 2 },
    { q: "Which force keeps planets in orbit around the sun?", options: ["Magnetism", "Gravity", "Friction", "Nuclear force"], answer: 1 },
    { q: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
    { q: "What is the atomic number of an element defined by?", options: ["Number of neutrons", "Number of protons", "Atomic mass", "Number of electrons shells"], answer: 1 },
    { q: "Which of these is a vector quantity?", options: ["Speed", "Mass", "Velocity", "Temperature"], answer: 2 },
    { q: "Sound travels fastest through:", options: ["Air", "Water", "Steel", "Vacuum"], answer: 2 },
  ],
  Vocabulary: [
    { q: "'Ephemeral' most nearly means:", options: ["Lasting forever", "Short-lived", "Extremely loud", "Deeply confusing"], answer: 1 },
    { q: "'Meticulous' most nearly means:", options: ["Careless", "Very careful and precise", "Fast-moving", "Emotional"], answer: 1 },
    { q: "'Ambivalent' most nearly means:", options: ["Confident", "Having mixed feelings", "Angry", "Enthusiastic"], answer: 1 },
    { q: "'Candid' most nearly means:", options: ["Honest and direct", "Secretive", "Nervous", "Formal"], answer: 0 },
    { q: "'Austere' most nearly means:", options: ["Luxurious", "Severely simple, without decoration", "Colorful", "Welcoming"], answer: 1 },
    { q: "'Resilient' most nearly means:", options: ["Fragile", "Able to recover quickly from difficulty", "Slow", "Stubborn"], answer: 1 },
  ],
};
export default QUESTION_BANKS;
