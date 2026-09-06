"use client";
import { CheckCircle, Package, XCircle } from "@phosphor-icons/react";
import { Sheet, useToast } from "@/components/ui/overlays";
import { SimTag } from "@/components/ui/primitives";
import { respondToInvitation } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { fmtDateLong, fmtPoints } from "@/lib/format";
import type { Campaign, Creator } from "@/lib/store/types";
import { effectiveDeadline } from "./helpers";

export type InvitationDecision = { campaign: Campaign; decision: "accepted" | "declined" };

/**
 * Confirmation sheet for accepting or declining a campaign invitation.
 * Nothing changes until the creator confirms here.
 */
export function InvitationSheet({ request, creator, onClose, onDone }: { request: InvitationDecision | null; creator: Creator; onClose: () => void; onDone?: (r: InvitationDecision) => void }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const accepting = request?.decision === "accepted";

  const confirm = () => {
    if (!request) return;
    respondToInvitation(request.campaign.id, creator.id, request.decision);
    if (accepting) toast(`You are in: ${request.campaign.title}`, "The brief is open and your product kit is queued.");
    else toast(`Passed on ${request.campaign.title}`, "The brand team will invite someone else from the shortlist.", "info");
    onDone?.(request);
    onClose();
  };

  return (
    <Sheet
      open={Boolean(request)}
      onClose={onClose}
      title={accepting ? "Join this campaign?" : "Pass on this one?"}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button className={accepting ? "btn-grass" : "btn-ink"} onClick={confirm}>
            {accepting ? <CheckCircle size={18} weight="fill" /> : <XCircle size={18} weight="fill" />}
            {accepting ? `${t.common.accept} ${request?.campaign.title ?? ""}` : "Yes, pass"}
          </button>
        </>
      }
    >
      {request && (
        <div className="flex flex-col gap-4 text-[14.5px]">
          <p className="text-ink">
            <span className="font-semibold">{request.campaign.title}</span>
            {accepting ? " comes with a brief, a product kit and feedback from a real person on the brand team." : " will stay closed for you. The brand team gets a note and moves on to the next creator on the shortlist."}
          </p>
          {accepting ? (
            <ul className="flex flex-col gap-2.5 rounded-input border border-line bg-paper-2 p-4">
              <li className="flex items-start gap-2.5">
                <Package size={20} weight="fill" className="mt-0.5 shrink-0 text-ink" />
                <span>
                  A product kit ships to <span className="font-semibold">{creator.address}</span>. Update the address on your profile if that has changed. <SimTag>Simulated courier</SimTag>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-ink" />
                <span>
                  Deliver by <span className="font-semibold">{fmtDateLong(effectiveDeadline(request.campaign), lang)}</span>. Revisions are unlimited.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-ink" />
                <span>
                  <span className="font-semibold">{fmtPoints(request.campaign.points)} {t.common.points}</span> go to pending when your cut is approved, and release once the live post is verified.
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-stone">No hard feelings. Declining does not affect your standing in the Squad. In this demo it cannot be undone, so if you are unsure, close this and read the brief first.</p>
          )}
        </div>
      )}
    </Sheet>
  );
}
