import React, { useState, useEffect, useRef } from "react";
import { GuestHeader } from "../header";
import { GuestBottomNav } from "../navigation";
import { AnnouncementTicker } from "../announcements";
import { FloatingWidgetMenu } from "../../../../components/guest/floating-widget";
import {
  useGuestConversation,
  useGuestUnreadMessageCount,
} from "../../../../hooks/guest-chat";
import { useGuestAnnouncements } from "../../../../hooks/announcements";

interface GuestPageLayoutProps {
  guestName: string;
  hotelName: string;
  roomNumber: string;
  guestId: string;
  dndStatus: boolean;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
  headerSlot?: React.ReactNode; // Optional slot for search bar or other sticky elements
  onClockClick?: () => void; // Callback for clock/room service button
  onMessageClick?: () => void; // Callback for message button
  requestCount?: number; // Number of pending requests to show on bell
  hotelId?: string; // Hotel ID for fetching conversation and announcements
}

export const GuestPageLayout: React.FC<GuestPageLayoutProps> = ({
  guestName,
  hotelName,
  roomNumber,
  guestId,
  dndStatus,
  currentPath,
  onNavigate,
  children,
  headerSlot,
  onClockClick,
  onMessageClick,
  requestCount = 0,
  hotelId,
}) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  // Fetch guest's conversation
  const { data: conversation } = useGuestConversation(guestId, hotelId);

  // Get unread message count
  const { data: messageCount = 0 } = useGuestUnreadMessageCount(
    conversation?.id,
    !!conversation?.id
  );

  // Fetch announcements
  const { data: announcements = [] } = useGuestAnnouncements(hotelId);

  // Format announcements for ticker
  const activeAnnouncements = announcements
    .filter((a) => a.is_active)
    .map((a) => ({
      id: a.id,
      message: `${a.title} • ${a.description}`,
    }));

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const currentScrollY = scrollContainerRef.current.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // Only hide/show if scrolled more than 10px to avoid jitter
      if (Math.abs(scrollDifference) > 10) {
        if (scrollDifference > 0 && currentScrollY > 100) {
          // Scrolling down & past 100px - hide header
          setIsHeaderVisible(false);
        } else if (scrollDifference < 0) {
          // Scrolling up - show header
          setIsHeaderVisible(true);
        }

        lastScrollY.current = currentScrollY;
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Fixed Header Section (Header + Ticker + Optional Search/Filter) - Fixed position */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-sm transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Header */}
        <GuestHeader
          guestName={guestName}
          hotelName={hotelName}
          roomNumber={roomNumber}
          guestId={guestId}
          dndStatus={dndStatus}
        />

        {/* Announcements Ticker */}
        {activeAnnouncements.length > 0 && (
          <AnnouncementTicker announcements={activeAnnouncements} />
        )}

        {/* Optional Header Slot (e.g., Search Bar) */}
        {headerSlot}
      </div>

      {/* Spacer for header height when visible */}
      <div
        className={`shrink-0 transition-all duration-300 ${
          isHeaderVisible ? "h-auto" : "h-0"
        }`}
      >
        <div className="invisible">
          <GuestHeader
            guestName={guestName}
            hotelName={hotelName}
            roomNumber={roomNumber}
            guestId={guestId}
            dndStatus={dndStatus}
          />
          {activeAnnouncements.length > 0 && (
            <AnnouncementTicker announcements={activeAnnouncements} />
          )}
          {headerSlot}
        </div>
      </div>

      {/* Main Content - Scrollable area with padding for fixed bottom nav */}
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Floating Widget Menu - Bell with Clock and Message buttons */}
      <FloatingWidgetMenu
        onClockClick={onClockClick}
        onMessageClick={onMessageClick}
        requestCount={requestCount}
        messageCount={messageCount}
      />

      {/* Bottom Navigation - Fixed at bottom */}
      <GuestBottomNav currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
