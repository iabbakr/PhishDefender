
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Award, RotateCw, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  rationale?: string;
};

interface QuizClientProps {
  questions: Question[];
  topicTitle: string;
  onFinish: () => void;
}

export function QuizClient({ questions, topicTitle, onFinish }: QuizClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleFinish = async () => {
    setIsFinished(true);
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            // Save the highest score for the topic
            const scoreField = `quizScores.${topicTitle}`;
            await setDoc(userRef, {
                quizScores: {
                    [topicTitle]: score
                }
            }, { merge: true });

            toast({
                title: "Quiz Score Saved!",
                description: `You scored ${score}/${questions.length} on "${topicTitle}". Check your profile for rank updates.`,
            });
        } catch (error) {
            console.error("Failed to save quiz score:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save your quiz score.",
            });
        }
    }
  }

  const handleNext = () => {
    if (isAnswered) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        handleFinish();
      }
    } else if (selectedAnswer) {
      setIsAnswered(true);
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };
  
  const handleRestart = () => {
    setIsFinished(false);
    onFinish();
  };

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="items-center">
            <Award className="h-16 w-16 text-primary"/>
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          <CardDescription>You finished the &quot;{topicTitle}&quot; quiz.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-bold">{score} / {questions.length}</p>
          <p className="text-muted-foreground">Your Score</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
        <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
        <CardDescription className="text-lg">{currentQuestion.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer ?? ''}
          onValueChange={setSelectedAnswer}
          disabled={isAnswered}
        >
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = currentQuestion.correctAnswer === option;
            const feedbackIcon = isCorrectAnswer ? <CheckCircle className="text-green-500" /> : <XCircle className="text-destructive" />;
            
            return (
              <Label
                key={index}
                className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                  isAnswered && isCorrectAnswer ? 'border-green-500 bg-green-500/10' : ''
                } ${
                  isAnswered && isSelected && !isCorrectAnswer ? 'border-destructive bg-destructive/10' : ''
                }`}
              >
                <RadioGroupItem value={option} />
                <span>{option}</span>
                {isAnswered && (isSelected || isCorrectAnswer) && <span className="ml-auto">{feedbackIcon}</span>}
              </Label>
            );
          })}
        </RadioGroup>
        {isAnswered && currentQuestion.rationale && (
          <Alert className="mt-4 border-l-4 border-blue-500 bg-blue-500/10">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Rationale</AlertTitle>
            <AlertDescription className="text-blue-700">
              {currentQuestion.rationale}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!selectedAnswer} className="w-full">
          {isAnswered ? (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz') : 'Submit Answer'}
        </Button>
      </CardFooter>
    </Card>
  );
}
