import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CardProps = Readonly<{
  title: string;
  subTitle: string;
  description: string;
  buttonTitle: string;
  onButtonClick: () => void; // Adicionado: função de callback para o botão
}>;

export default function Cards({
  title,
  subTitle,
  buttonTitle,
  description,
  onButtonClick, // Adicionado: recebendo a função de callback
}: CardProps) {
  return (
    <Card className="h-auto p-4">
      <CardHeader className="flex-1 align-baseline">
        <CardTitle className="text-lg md:text-xl text-[#1E3A8A]">
          {title}
        </CardTitle>
        <h2 className="text-md md:text-lg text-[#081534] pb-1.5">{subTitle}</h2>
      </CardHeader>

      <CardContent className="flex-1 justify-center">
        <CardDescription className="text-sm md:text-base text-[#081534]">
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter className="w-full">
        <Button
          className="w-full bg-[#1E3A8A] text-white hover:bg-[#152C6B] transition-colors duration-200 cursor-pointer"
          onClick={onButtonClick}
        >
          {buttonTitle}
        </Button>
      </CardFooter>
    </Card>
  );
}
