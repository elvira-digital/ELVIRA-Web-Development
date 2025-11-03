/**
 * Laundry Cart Bottom Sheet
 *
 * Displays laundry services in the cart with quantity controls
 */

import React, { useState } from "react";
import { Shirt } from "lucide-react";
import { GuestBottomSheet } from "../../shared/modals/GuestBottomSheet";
import { useGuestCart } from "../../../../contexts/guest";
import { MenuItemCard } from "../../shared/cards/menu-item";
import { GuestButton } from "../../../../components/guest/shared/buttons";
import {
  LaundryCheckoutForm,
  type LaundryOrderData,
} from "./LaundryCheckoutForm";
import { createLaundryOrder } from "../../../../services/guest";

interface LaundryCartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaundryCartBottomSheet: React.FC<LaundryCartBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    laundryCart,
    incrementLaundryItem,
    decrementLaundryItem,
    clearLaundryCart,
  } = useGuestCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const totalItems = laundryCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = laundryCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = async (data: LaundryOrderData) => {
    setIsSubmitting(true);

    try {
      const result = await createLaundryOrder({
        items: data.items,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime || undefined,
        deliveryDate: data.deliveryDate,
        deliveryTime: data.deliveryTime || undefined,
        specialInstructions: data.specialInstructions || undefined,
      });

      if (result.success) {
        // Clear cart and close
        clearLaundryCart();
        setShowCheckoutForm(false);
        onClose();

        // TODO: Show success notification
        console.log("✅ Laundry order submitted successfully");
      } else {
        // Show error notification
        console.error("❌ Failed to submit order:", result.error);
        alert(`Failed to submit order: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error submitting order:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
  };

  const handleClose = () => {
    setShowCheckoutForm(false);
    onClose();
  };

  // Show checkout form if user clicked checkout
  if (showCheckoutForm && laundryCart.length > 0) {
    return (
      <GuestBottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="Laundry Checkout"
        maxHeight="90vh"
      >
        <LaundryCheckoutForm
          cartItems={laundryCart}
          onSubmit={handleSubmitOrder}
          onCancel={handleCancelCheckout}
          isSubmitting={isSubmitting}
          onIncrement={incrementLaundryItem}
          onDecrement={decrementLaundryItem}
        />
      </GuestBottomSheet>
    );
  }

  return (
    <GuestBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Laundry Cart"
      maxHeight="90vh"
    >
      <div className="px-6 pt-4 pb-6">
        {/* Cart Summary Header */}
        {laundryCart.length > 0 && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              {totalItems} item{totalItems !== 1 ? "s" : ""} • $
              {totalPrice.toFixed(2)} total
            </p>
          </div>
        )}

        {/* Empty State */}
        {laundryCart.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Your laundry cart is empty
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Browse our laundry services and add items to get started!
            </p>
          </div>
        )}

        {/* Cart Items */}
        {laundryCart.length > 0 && (
          <div className="space-y-3 mb-6">
            {laundryCart.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                title={`${item.category} - ${item.name}`}
                description={item.description || ""}
                price={item.price}
                quantity={item.quantity}
                onIncrement={incrementLaundryItem}
                onDecrement={decrementLaundryItem}
                onCardClick={() => {}} // Disable card click in cart
              />
            ))}
          </div>
        )}

        {/* Checkout Button */}
        {laundryCart.length > 0 && (
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <GuestButton fullWidth size="md" onClick={handleCheckout}>
              Continue to Checkout • ${totalPrice.toFixed(2)}
            </GuestButton>
          </div>
        )}
      </div>
    </GuestBottomSheet>
  );
};
