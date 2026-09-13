"use client";

import { useState } from "react";
import { computeBalanceTransfer } from "@/lib/balance-transfer";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function monthsLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value === 1) return "1 mo";
  return `${value.toLocaleString()} mo`;
}

export function BalanceTransferCalculator() {
  const [currentBalance, setCurrentBalance] = useState("5000");
  const [currentAprPercent, setCurrentAprPercent] = useState("22.99");
  const [monthlyPayment, setMonthlyPayment] = useState("200");
  const [transferFeePercent, setTransferFeePercent] = useState("3");
  const [transferFeeFlat, setTransferFeeFlat] = useState("0");
  const [promoAprPercent, setPromoAprPercent] = useState("0");
  const [promoLengthMonths, setPromoLengthMonths] = useState("15");
  const [regularAprPercent, setRegularAprPercent] = useState("19.99");

  const result = computeBalanceTransfer({
    currentBalance: parseAmount(currentBalance),
    currentAprPercent: parseAmount(currentAprPercent),
    monthlyPayment: parseAmount(monthlyPayment),
    transferFeePercent:
      transferFeePercent.trim() === "" ? 0 : parseAmount(transferFeePercent),
    transferFeeFlat: transferFeeFlat.trim() === "" ? 0 : parseAmount(transferFeeFlat),
    promoAprPercent: parseAmount(promoAprPercent),
    promoLengthMonths: parseAmount(promoLengthMonths),
    regularAprPercent: parseAmount(regularAprPercent),
  });

  const savings = result.estimatedSavings;
  const extraCost = savings !== null && savings < 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-text">Current card</legend>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Current balance</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={currentBalance}
              onChange={(event) => setCurrentBalance(event.target.value)}
              className="input-field"
              placeholder="5000"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">Current APR (annual %)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={currentAprPercent}
              onChange={(event) => setCurrentAprPercent(event.target.value)}
              className="input-field"
              placeholder="22.99"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">Monthly payment</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={monthlyPayment}
              onChange={(event) => setMonthlyPayment(event.target.value)}
              className="input-field"
              placeholder="200"
            />
            <span className="mt-2 block text-muted">
              Same payment is used on both the stay-put and transfer paths.
            </span>
          </label>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-text">Transfer offer</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Transfer fee (%)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={transferFeePercent}
                onChange={(event) => setTransferFeePercent(event.target.value)}
                className="input-field"
                placeholder="3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Flat fee ($)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={transferFeeFlat}
                onChange={(event) => setTransferFeeFlat(event.target.value)}
                className="input-field"
                placeholder="0"
              />
            </label>
          </div>
          <span className="mt-2 block text-sm text-muted">
            Common offers charge 3–5% of the transferred amount, sometimes plus a
            flat fee. Both can be 0.
          </span>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">Promo APR (annual %)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={promoAprPercent}
              onChange={(event) => setPromoAprPercent(event.target.value)}
              className="input-field"
              placeholder="0"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">Promo length (months)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={promoLengthMonths}
              onChange={(event) => setPromoLengthMonths(event.target.value)}
              className="input-field"
              placeholder="15"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Regular / go-to APR after promo (annual %)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={regularAprPercent}
              onChange={(event) => setRegularAprPercent(event.target.value)}
              className="input-field"
              placeholder="19.99"
            />
            <span className="mt-2 block text-muted">
              Applied to any leftover balance after the promo window.
            </span>
          </label>
        </fieldset>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Transfer vs stay put</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label={
              extraCost ? "Estimated extra cost vs stay put" : "Estimated savings vs stay put"
            }
            value={
              savings === null
                ? "—"
                : extraCost
                  ? money(Math.abs(savings))
                  : money(savings)
            }
            emphasize
          />

          <div className="border-t border-line pt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Transfer path
            </p>
            <ResultRow label="Transfer fee" value={money(result.transferFee)} />
            <div className="mt-3">
              <ResultRow
                label="Starting balance after fee"
                value={money(result.startingBalanceAfterFee)}
              />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Months to pay off"
                value={
                  result.transferNeverPaysOff
                    ? "Never"
                    : monthsLabel(result.transferMonthsToPayoff)
                }
              />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Paid off during promo"
                value={
                  !result.valid
                    ? "—"
                    : result.transferNeverPaysOff
                      ? "No"
                      : result.paidOffDuringPromo
                        ? "Yes"
                        : "No"
                }
              />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Total interest"
                value={money(result.transferTotalInterest)}
              />
            </div>
            <div className="mt-3">
              <ResultRow
                label="Total cost (interest + fee)"
                value={money(result.transferTotalCost)}
              />
            </div>
          </div>

          <div className="border-t border-line pt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Stay-put path
            </p>
            <ResultRow
              label="Months to pay off"
              value={
                result.stayNeverPaysOff ? "Never" : monthsLabel(result.stayMonthsToPayoff)
              }
            />
            <div className="mt-3">
              <ResultRow label="Total interest" value={money(result.stayTotalInterest)} />
            </div>
          </div>
        </dl>

        {result.valid && result.paymentTooLow ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.stayNeverPaysOff && result.transferNeverPaysOff
              ? "This monthly payment never covers interest on either path, so the balances never pay off. Raise the payment or lower the APRs to see a payoff."
              : result.stayNeverPaysOff
                ? "This monthly payment never covers interest on the current card, so stay-put never pays off. The transfer path can still be compared on its own payoff and cost."
                : "This monthly payment never covers interest after the transfer, so that path never pays off. Raise the payment or check the go-to APR."}
          </p>
        ) : null}

        {result.valid && result.willNotFinishInPromo && !result.transferNeverPaysOff ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            The transferred balance is not paid off during the promo window. Leftover
            principal starts accruing the regular / go-to APR.
          </p>
        ) : null}

        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter a current balance above 0, a monthly payment above 0, APRs of 0% or
            more, transfer fees of 0 or more, and a promo length from 0 to 120 months.
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
