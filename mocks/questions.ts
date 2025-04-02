import { Question } from '@/types/game';

export const questions: Question[] = [
  {
    id: '1',
    text: "Which planet is known as the 'Red Planet'?",
    options: ["Venus", "Mars", "Jupiter"],
    correctAnswer: 1,
    category: "science",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '2',
    text: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci"],
    correctAnswer: 2,
    category: "art",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '3',
    text: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo"],
    correctAnswer: 2,
    category: "geography",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '4',
    text: "Which of these is NOT a programming language?",
    options: ["Java", "Python", "Electron"],
    correctAnswer: 2,
    category: "technology",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '5',
    text: "What year did the Titanic sink?",
    options: ["1910", "1912", "1915"],
    correctAnswer: 1,
    category: "history",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '6',
    text: "Which element has the chemical symbol 'Au'?",
    options: ["Silver", "Gold", "Aluminum"],
    correctAnswer: 1,
    category: "science",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '7',
    text: "Who wrote 'To Kill a Mockingbird'?",
    options: ["J.K. Rowling", "Stephen King", "Harper Lee"],
    correctAnswer: 2,
    category: "literature",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '8',
    text: "What is the smallest prime number?",
    options: ["1", "2", "3"],
    correctAnswer: 1,
    category: "mathematics",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '9',
    text: "Which of these countries is NOT in Europe?",
    options: ["Portugal", "Thailand", "Sweden"],
    correctAnswer: 1,
    category: "geography",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '10',
    text: "Who directed the movie 'Inception'?",
    options: ["Steven Spielberg", "James Cameron", "Christopher Nolan"],
    correctAnswer: 2,
    category: "entertainment",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  },
  {
    id: '11',
    text: "What is the largest organ in the human body?",
    options: ["Brain", "Liver", "Skin"],
    correctAnswer: 2,
    category: "science",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '12',
    text: "Which company created the iPhone?",
    options: ["Microsoft", "Google", "Apple"],
    correctAnswer: 2,
    category: "technology",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '13',
    text: "What is the hardest natural substance on Earth?",
    options: ["Diamond", "Platinum", "Titanium"],
    correctAnswer: 0,
    category: "science",
    difficulty: "easy",
    points: 100,
    timeLimit: 10
  },
  {
    id: '14',
    text: "Which of these is NOT one of the Seven Wonders of the Ancient World?",
    options: ["Great Pyramid of Giza", "Colosseum", "Hanging Gardens of Babylon"],
    correctAnswer: 1,
    category: "history",
    difficulty: "hard",
    points: 300,
    timeLimit: 10
  },
  {
    id: '15',
    text: "In which year did World War II end?",
    options: ["1943", "1945", "1947"],
    correctAnswer: 1,
    category: "history",
    difficulty: "medium",
    points: 200,
    timeLimit: 10
  }
];

export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};