"""CampusXP calculation engine — ranks, penalties, grades."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

EventLevel = Literal['Local', 'State', 'National']
StudentRole = Literal['Participant', 'Volunteer', 'Winner']

# Locked institutional weights (faculty cannot override)
LEVEL_BASE_XP: dict[EventLevel, int] = {
    'Local': 20,
    'State': 50,
    'National': 100,
}

ROLE_MULTIPLIER: dict[StudentRole, float] = {
    'Participant': 1.0,
    'Volunteer': 1.5,
    'Winner': 2.0,
}

DEFAULT_EVENTS_REQUIRED = 5
MAX_XP_CEILING = 1000  # hard ceiling per college board
XP_GRADE_SCALE = [
    (500, 'O'),
    (400, 'A+'),
    (300, 'A'),
    (200, 'B+'),
    (100, 'B'),
    (50, 'C'),
    (1, 'D'),
    (0, 'F'),
]


@dataclass
class DangerZoneStatus:
    events_count: int
    events_required: int
    is_safe: bool
    penalty_reduction: int

    @property
    def label(self) -> str:
        return 'Safe' if self.is_safe else 'Danger Zone'


def calculate_event_xp(level: EventLevel, role: StudentRole) -> int:
    """National Winner = 100 × 2 = 200 XP"""
    raw = LEVEL_BASE_XP[level] * ROLE_MULTIPLIER[role]
    return min(int(round(raw)), MAX_XP_CEILING)


def clamp_xp(value: int) -> int:
    """Hard floor/ceiling — points cannot fall below 0."""
    return max(0, min(value, MAX_XP_CEILING))


def evaluate_danger_zone(
    events_count: int,
    events_required: int = DEFAULT_EVENTS_REQUIRED,
) -> DangerZoneStatus:
    is_safe = events_count >= events_required
    deficit = max(0, events_required - events_count)
    penalty_reduction = 0 if is_safe else deficit * 5  # 5 marks per missing event
    return DangerZoneStatus(
        events_count=events_count,
        events_required=events_required,
        is_safe=is_safe,
        penalty_reduction=penalty_reduction,
    )


def recalculate_ranks(students: list[dict]) -> list[dict]:
    """Sort by total_xp desc and assign global rank."""
    ordered = sorted(students, key=lambda s: s['total_xp'], reverse=True)
    for i, student in enumerate(ordered, start=1):
        student['rank'] = i
    return ordered


def map_xp_to_grade(total_xp: int) -> str:
    for threshold, grade in XP_GRADE_SCALE:
        if total_xp >= threshold:
            return grade
    return 'F'


def final_score_with_floor(base_score: int, penalty: int) -> int:
    """max(0, final_score) — no negative grades to university records."""
    return max(0, base_score - penalty)


def exemption_frozen_threshold(approved: bool, frozen_to: int = 3) -> int | None:
    """Approval freezes requirement (e.g. 5 → 3) without fabricating XP."""
    return frozen_to if approved else None
