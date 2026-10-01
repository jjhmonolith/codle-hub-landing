#!/usr/bin/env python3
"""Validate Gate 0 evidence integrity for the new Codle Discovery Pack."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY_FRAGMENT = "codle-landing-plan/design-source-pack"
VALID_STATUSES = {"approved", "pending", "prohibited"}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def main() -> None:
    required = [
        ROOT / "README.md",
        ROOT / "00-charter/project-charter.md",
        ROOT / "00-charter/decision-log.md",
        ROOT / "01-evidence/product-inventory.csv",
        ROOT / "01-evidence/claim-ledger.json",
        ROOT / "01-evidence/receipts/receipt-register.csv",
        ROOT / "02-research/reference-reverification-questions.md",
        ROOT / "03-strategy/README.md",
        ROOT / "04-design-contract/README.md",
        ROOT / "05-validation/README.md",
    ]
    missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
    if missing:
        raise SystemExit(f"FAIL missing files: {missing}")

    receipts = read_csv(ROOT / "01-evidence/receipts/receipt-register.csv")
    receipt_ids = {row["receipt_id"] for row in receipts}
    if len(receipt_ids) != len(receipts):
        raise SystemExit("FAIL duplicate receipt IDs")

    inventory = read_csv(ROOT / "01-evidence/product-inventory.csv")
    unresolved_receipts: dict[str, list[str]] = {}
    for row in inventory:
        refs = [x.strip() for x in row["receipt_ids"].split(";") if x.strip()]
        unknown = [x for x in refs if x not in receipt_ids]
        if unknown:
            unresolved_receipts[row["inventory_id"]] = unknown
    if unresolved_receipts:
        raise SystemExit(f"FAIL unknown inventory receipts: {unresolved_receipts}")

    ledger_path = ROOT / "01-evidence/claim-ledger.json"
    ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
    claims = ledger.get("claims", [])
    claim_ids = [claim.get("claim_id") for claim in claims]
    if len(claim_ids) != len(set(claim_ids)):
        raise SystemExit("FAIL duplicate claim IDs")

    for claim in claims:
        status = claim.get("status")
        if status not in VALID_STATUSES:
            raise SystemExit(f"FAIL invalid status: {claim.get('claim_id')}={status}")
        if LEGACY_FRAGMENT in str(claim.get("source_path_or_url", "")):
            raise SystemExit(f"FAIL legacy Source Pack used as claim source: {claim.get('claim_id')}")
        if status == "approved":
            if not claim.get("owner") or str(claim["owner"]).startswith("TBD"):
                raise SystemExit(f"FAIL approved claim without owner: {claim.get('claim_id')}")
            if not claim.get("allowed_surfaces"):
                raise SystemExit(f"FAIL approved claim without allowed surface: {claim.get('claim_id')}")
            if not claim.get("source_path_or_url") or not claim.get("source_locator"):
                raise SystemExit(f"FAIL approved claim without provenance: {claim.get('claim_id')}")

    legacy_inventory_rows = [
        row["inventory_id"]
        for row in inventory
        if LEGACY_FRAGMENT in row.get("receipt_ids", "")
    ]
    if legacy_inventory_rows:
        raise SystemExit(f"FAIL legacy Source Pack used in inventory: {legacy_inventory_rows}")

    approved = sum(1 for c in claims if c["status"] == "approved")
    pending = sum(1 for c in claims if c["status"] == "pending")
    prohibited = sum(1 for c in claims if c["status"] == "prohibited")
    print("PASS Gate 0 evidence integrity")
    print(f"receipts={len(receipts)} inventory_rows={len(inventory)} claims={len(claims)}")
    print(f"approved={approved} pending={pending} prohibited={prohibited}")
    if approved == 0:
        print("STATUS gate-not-approved: owner review is still required before design/AI copy")


if __name__ == "__main__":
    main()
