import React from "react";
import { SearchFilterBar } from "../../shared/search-filter";
import { CartButton } from "../../../../components/guest/shared/cart";

interface GuestLaundryHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBackClick: () => void;
  cartCount?: number;
  onCartClick?: () => void;
}

export const GuestLaundryHeader: React.FC<GuestLaundryHeaderProps> = ({
  searchValue,
  onSearchChange,
  onBackClick,
  cartCount,
  onCartClick,
}) => {
  return (
    <SearchFilterBar
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onBackClick={onBackClick}
      placeholder="Search laundry services..."
      cartButton={
        cartCount !== undefined && onCartClick ? (
          <CartButton itemCount={cartCount} onClick={onCartClick} />
        ) : undefined
      }
    />
  );
};
