/**
 * Q&A Category Cards Component
 *
 * Displays a single card to navigate to Q&A section
 */

import React from "react";
import { CategoryCard } from "./CategoryCard";

interface QnACategoryCardsProps {
  onNavigate?: (path: string) => void;
}

export const QnACategoryCards: React.FC<QnACategoryCardsProps> = ({
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-4">
      <CategoryCard
        title="Q&A"
        description="Frequently asked questions"
        onClick={() => onNavigate?.("/guest/qa")}
      />
    </div>
  );
};
