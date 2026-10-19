"use client";

import { useState } from "react";
import {
  computeRoom,
  formatArea,
  SHAPE_FIELDS,
  totalArea,
  type AreaShape,
  type FeetInches,
  type RoomInput,
} from "@/lib/square-footage";

const SHAPES: { id: AreaShape; label: string }[] = [
  { id: "rectangle", label: "Rectangle or square" },
  { id: "l-shape", label: "L-shape" },
  { id: "triangle", label: "Triangle" },
  { id: "circle", label: "Circle" },
];

type Room = RoomInput & { id: number; name: string };

const emptyDims = (): Record<string, FeetInches> => ({});

let nextId = 2;

export function SquareFootageCalculator() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "Room 1", shape: "rectangle", dims: { length: { ft: "12", in: "" }, width: { ft: "10", in: "" } }, quantity: "1" },
  ]);
  const [waste, setWaste] = useState("0");

  const updateRoom = (id: number, patch: Partial<Room>) =>
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const updateDim = (id: number, key: string, part: "ft" | "in", value: string) =>
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, dims: { ...r.dims, [key]: { ft: r.dims[key]?.ft ?? "", in: r.dims[key]?.in ?? "", [part]: value } } }
          : r,
      ),
    );

  const addRoom = () => {
    const id = nextId++;
    setRooms((prev) => [...prev, { id, name: `Room ${prev.length + 1}`, shape: "rectangle", dims: emptyDims(), quantity: "1" }]);
  };

  const removeRoom = (id: number) => setRooms((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const totals = totalArea(rooms, waste);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {rooms.map((room, index) => {
          const result = computeRoom(room);
          return (
            <fieldset key={room.id} className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6">
              <legend className="sr-only">{room.name || `Room ${index + 1}`}</legend>
              <div className="flex flex-wrap items-end gap-3">
                <label className="block min-w-0 flex-1 text-sm" htmlFor={`sqft-name-${room.id}`}>
                  <span className="mb-2 block text-xs text-muted">Room or area name</span>
                  <input
                    id={`sqft-name-${room.id}`}
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    autoComplete="off"
                    className="input-field"
                  />
                </label>
                <label className="block w-24 text-sm" htmlFor={`sqft-qty-${room.id}`}>
                  <span className="mb-2 block text-xs text-muted">Quantity</span>
                  <input
                    id={`sqft-qty-${room.id}`}
                    value={room.quantity ?? ""}
                    onChange={(e) => updateRoom(room.id, { quantity: e.target.value })}
                    inputMode="decimal"
                    autoComplete="off"
                    className="input-field font-mono"
                  />
                </label>
                {rooms.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    className="rounded-full border border-line px-3 py-2 text-sm text-muted hover:text-text"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Shape for ${room.name || `room ${index + 1}`}`}>
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={room.shape === s.id}
                    onClick={() => updateRoom(room.id, { shape: s.id })}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      room.shape === s.id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {room.shape === "l-shape" ? (
                <p className="text-xs leading-5 text-muted">
                  Split the L into two rectangles that do not overlap (A and B) and enter each one.
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                {SHAPE_FIELDS[room.shape].map((field) => (
                  <div key={field.key} className="text-sm">
                    <span className="mb-2 block text-xs text-muted">{field.label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block" htmlFor={`sqft-${room.id}-${field.key}-ft`}>
                        <span className="sr-only">{field.label} feet</span>
                        <div className="flex items-center gap-1">
                          <input
                            id={`sqft-${room.id}-${field.key}-ft`}
                            value={room.dims[field.key]?.ft ?? ""}
                            onChange={(e) => updateDim(room.id, field.key, "ft", e.target.value)}
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0"
                            className="input-field font-mono"
                          />
                          <span className="text-xs text-muted">ft</span>
                        </div>
                      </label>
                      <label className="block" htmlFor={`sqft-${room.id}-${field.key}-in`}>
                        <span className="sr-only">{field.label} inches</span>
                        <div className="flex items-center gap-1">
                          <input
                            id={`sqft-${room.id}-${field.key}-in`}
                            value={room.dims[field.key]?.in ?? ""}
                            onChange={(e) => updateDim(room.id, field.key, "in", e.target.value)}
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0"
                            className="input-field font-mono"
                          />
                          <span className="text-xs text-muted">in</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted" aria-live="polite">
                {result.valid ? (
                  <>
                    Area:{" "}
                    <span className="font-mono text-text">{formatArea(result.areaSqFt)} sq ft</span>
                    {result.quantity !== 1 ? ` (${formatArea(result.eachSqFt)} sq ft × ${formatArea(result.quantity)})` : null}
                  </>
                ) : (
                  result.error
                )}
              </p>
            </fieldset>
          );
        })}
        <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-card p-4 sm:p-6">
          <button
            type="button"
            onClick={addRoom}
            className="rounded-full border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10"
          >
            Add another room or area
          </button>
          <label className="block w-40 text-sm" htmlFor="sqft-waste">
            <span className="mb-2 block text-xs text-muted">Extra for waste (%)</span>
            <input
              id="sqft-waste"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className="input-field font-mono"
            />
          </label>
          <p className="w-full text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
        </div>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Total area</h2>
        {"error" in totals ? (
          <p className="mt-4 text-sm leading-6 text-muted">{totals.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">{formatArea(totals.base.sqFt)} sq ft</p>
            {totals.wastePercent > 0 ? (
              <p className="text-muted">
                With {formatArea(totals.wastePercent)}% waste:{" "}
                <span className="font-mono text-text">{formatArea(totals.withWaste.sqFt)} sq ft</span>
              </p>
            ) : null}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Square yards</dt>
              <dd className="text-right">{formatArea(totals.withWaste.sqYd)}</dd>
              <dt className="font-sans text-muted">Square meters</dt>
              <dd className="text-right">{formatArea(totals.withWaste.sqM)}</dd>
              <dt className="font-sans text-muted">Square inches</dt>
              <dd className="text-right">{formatArea(totals.withWaste.sqIn, 0)}</dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              {totals.validRooms} {totals.validRooms === 1 ? "area" : "areas"} counted
              {totals.invalidRooms > 0 ? `; ${totals.invalidRooms} incomplete ${totals.invalidRooms === 1 ? "area" : "areas"} skipped` : ""}.
              {totals.wastePercent > 0 ? " Conversions include waste." : ""}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
