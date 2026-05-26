import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Loader2 } from "lucide-react";
import clsx from "clsx";
import { getSeatMap, type SeatDeck } from "@/lib/api";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seatNumber: string) => void;
  price: string;
  flightId?: string;
}

export default function SeatSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  price,
  flightId,
}: SeatSelectionModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<SeatDeck[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && flightId) {
      // Check for SerpAPI/Google Flights ID - REMOVED (Backend now handles fallback)
      /*
      if (flightId.startsWith("serp-")) {
        setLoading(false);
        setError(true);
        return;
      }
      */

      setLoading(true);
      setError(false);
      getSeatMap(flightId)
        .then((data) => {
          if (data.decks.length > 0) {
            setDecks(data.decks);
          } else {
            // Fallback to mock if API returns empty (common in test environment)
            setError(true);
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [isOpen, flightId]);

  if (!isOpen) return null;

  const handleSeatClick = (seat: string) => {
    setSelectedSeat(seat === selectedSeat ? null : seat);
  };

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p>Fetching real-time seat map...</p>
        </div>
      );
    }

    if (error || decks.length === 0) {
      const isSerp = flightId?.startsWith("serp-");
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400 p-6 text-center">
          <p>{isSerp ? "Seat selection not supported for this provider." : "Real-time seat map unavailable."}</p>
          <p className="text-xs">
            {isSerp
              ? "This flight is from a third-party provider. Please select your seats during check-in with the airline."
              : "You can still proceed with booking. Seat assignment will be handled at check-in."}
          </p>
          <Button variant="outline" onClick={() => onConfirm("Any")} className="mt-2">
            Skip Seat Selection
          </Button>
        </div>
      );
    }

    // Use the first deck (usually main deck)
    const deck = decks[0];

    return (
      <div className="grid gap-y-3 justify-center pb-8">
        {deck.rows.map((row) => (
          <div key={row.number} className="flex gap-4 items-center">
            {/* Left Side Seats */}
            <div className="flex gap-1">
              {row.seats.slice(0, Math.ceil(row.seats.length / 2)).map((seat) => {
                const isOccupied = seat.status !== "AVAILABLE";
                const isSelected = selectedSeat === seat.number;

                return (
                  <button
                    key={seat.number}
                    disabled={isOccupied}
                    onClick={() => handleSeatClick(seat.number)}
                    title={seat.price ? `${seat.currency} ${seat.price}` : seat.status}
                    className={clsx(
                      "w-8 h-8 rounded-t-lg rounded-b-sm text-[10px] font-medium transition-all flex items-center justify-center border relative group",
                      isOccupied
                        ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                        : isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300"
                    )}
                  >
                    {seat.column}
                    {/* Tooltip for price */}
                    {!isOccupied && seat.price && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                        {seat.currency} {seat.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Row Number */}
            <div className="w-6 text-center text-xs text-slate-600 font-mono">
              {row.number}
            </div>

            {/* Right Side Seats */}
            <div className="flex gap-1">
              {row.seats.slice(Math.ceil(row.seats.length / 2)).map((seat) => {
                const isOccupied = seat.status !== "AVAILABLE";
                const isSelected = selectedSeat === seat.number;

                return (
                  <button
                    key={seat.number}
                    disabled={isOccupied}
                    onClick={() => handleSeatClick(seat.number)}
                    title={seat.price ? `${seat.currency} ${seat.price}` : seat.status}
                    className={clsx(
                      "w-8 h-8 rounded-t-lg rounded-b-sm text-[10px] font-medium transition-all flex items-center justify-center border relative group",
                      isOccupied
                        ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                        : isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300"
                    )}
                  >
                    {seat.column}
                    {/* Tooltip for price */}
                    {!isOccupied && seat.price && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                        {seat.currency} {seat.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-lg font-semibold text-white">Select Your Seat</h3>
            <p className="text-xs text-slate-400">
              {loading ? "Loading map..." : error ? "Map unavailable" : "Real-time availability"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Seat Map Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 custom-scrollbar relative">
          {!loading && !error && (
            <div className="flex justify-center mb-8 sticky top-0 z-10">
              <div className="w-16 h-16 border-t-4 border-l-4 border-r-4 border-slate-700 rounded-t-full opacity-20" />
            </div>
          )}

          {renderContent()}
        </div>

        {/* Legend (only show if valid map) */}
        {!loading && !error && (
          <div className="px-6 py-3 bg-slate-900 border-t border-white/5 flex justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-800/50 border border-slate-700" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-600 border border-indigo-500" />
              <span>Selected</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Price</p>
            <p className="text-lg font-bold text-white">{price}</p>
          </div>
          <Button
            onClick={() => {
              if (error) {
                onConfirm("Any");
              } else if (selectedSeat) {
                onConfirm(selectedSeat);
              }
            }}
            disabled={!selectedSeat && !error}
            className="px-8"
          >
            {error ? "Skip Selection" : `Confirm Seat ${selectedSeat ? `(${selectedSeat})` : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
