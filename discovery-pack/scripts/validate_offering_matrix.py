#!/usr/bin/env python3
"""Validate offering discovery matrix and commercial relationship evidence links."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECEIPTS = ROOT / "01-evidence/receipts/receipt-register.csv"
MATRIX = ROOT / "02-research/offering-discovery-matrix.csv"
RELATIONS = ROOT / "01-evidence/commercial-relationships.csv"
CANDIDATES = ROOT / "02-research/additional-offering-candidates.csv"
EXPECTED = {"P-001", "P-002", "P-003", "P-004", "P-005", "P-006"}


def rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def refs(value: str) -> set[str]:
    return {part.strip() for part in value.split(";") if part.strip()}


receipt_rows = rows(RECEIPTS)
receipt_ids = {row["receipt_id"] for row in receipt_rows}
matrix = rows(MATRIX)
relations = rows(RELATIONS)
candidates = rows(CANDIDATES)
errors: list[str] = []

ids = [row["offering_id"] for row in matrix]
if set(ids) != EXPECTED:
    errors.append(f"matrix IDs mismatch: expected={sorted(EXPECTED)} actual={sorted(set(ids))}")
if len(ids) != len(set(ids)):
    errors.append("duplicate offering_id in matrix")

required_matrix = {
    "offering_id",
    "top_level_offering",
    "perception_role",
    "purchase_configuration",
    "receipt_ids",
    "evidence_status",
    "next_owner_decision",
}
if matrix and not required_matrix.issubset(matrix[0]):
    errors.append(f"matrix missing fields: {sorted(required_matrix - set(matrix[0]))}")

for row in matrix:
    missing_refs = refs(row["receipt_ids"]) - receipt_ids
    if missing_refs:
        errors.append(f"{row['offering_id']} missing receipts: {sorted(missing_refs)}")
    for field in ("top_level_offering", "perception_role", "purchase_configuration", "evidence_status", "next_owner_decision"):
        if not row.get(field, "").strip():
            errors.append(f"{row['offering_id']} empty {field}")

relation_ids = [row["relation_id"] for row in relations]
if len(relation_ids) != len(set(relation_ids)):
    errors.append("duplicate relation_id")
for row in relations:
    missing_refs = refs(row["receipt_ids"]) - receipt_ids
    if missing_refs:
        errors.append(f"{row['relation_id']} missing receipts: {sorted(missing_refs)}")

candidate_ids = [row["candidate_id"] for row in candidates]
if len(candidate_ids) != len(set(candidate_ids)):
    errors.append("duplicate candidate_id")
for row in candidates:
    missing_refs = refs(row["source_receipts"]) - receipt_ids
    if missing_refs:
        errors.append(f"{row['candidate_id']} missing receipts: {sorted(missing_refs)}")
    if row["status"] not in {"closed-not-offering", "promoted-as-child"}:
        errors.append(f"{row['candidate_id']} has invalid owner-review status: {row['status']}")

jitda = next((row for row in candidates if row["candidate_id"] == "CAND-003"), None)
if not jitda or jitda["status"] != "promoted-as-child" or "P-006" not in jitda["placement"]:
    errors.append("CAND-003 Jitda must be promoted as a P-006 child")

if errors:
    print("FAIL offering matrix validation")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("PASS offering matrix validation")
print(
    f"top_level_offerings={len(matrix)} commercial_relations={len(relations)} "
    f"additional_candidates={len(candidates)} receipts={len(receipt_rows)}"
)
