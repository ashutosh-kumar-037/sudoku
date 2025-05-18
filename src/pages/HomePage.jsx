import React from "react";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold flex items-center">
          Sudoku
          <Pencil className="mt-2" />
        </h1>
      </header>

      <div className="w-52 flex flex-col gap-2">
        <Link to={"game/easy"}>
          <Button className="w-full h-12">Easy</Button>
        </Link>

        <Link to={"game/medium"}>
          <Button className="w-full h-12">Medium</Button>
        </Link>

        <Link to={"game/hard"}>
          <Button className="w-full h-12">Hard</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
