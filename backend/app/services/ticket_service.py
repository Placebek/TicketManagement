from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.models.ticket import PRIORITY_ORDER, Priority, Status, Ticket
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.services.exceptions import (
    InvalidTransitionError,
    TicketLockedError,
    TicketNotFoundError,
)

# Allowed status transitions. `done` is terminal: it maps to an empty set, so
# nothing can leave it. A no-op transition (same status) is permitted except
# out of `done`.
ALLOWED_TRANSITIONS: dict[Status, set[Status]] = {
    Status.new: {Status.in_progress, Status.done},
    Status.in_progress: {Status.done, Status.new},
    Status.done: set(),
}

SORTABLE_FIELDS = {"created_at", "updated_at", "priority"}


def get_ticket(db: Session, ticket_id: int) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise TicketNotFoundError(f"Ticket {ticket_id} not found")
    return ticket


def create_ticket(db: Session, data: TicketCreate) -> Ticket:
    ticket = Ticket(title=data.title, description=data.description, priority=data.priority)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket(db: Session, ticket_id: int, data: TicketUpdate) -> Ticket:
    ticket = get_ticket(db, ticket_id)
    if ticket.status == Status.done:
        raise TicketLockedError("A ticket in 'done' status cannot be edited")

    fields = data.model_dump(exclude_unset=True)
    for key, value in fields.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)
    return ticket


def change_status(db: Session, ticket_id: int, new_status: Status) -> Ticket:
    ticket = get_ticket(db, ticket_id)

    if ticket.status == Status.done:
        raise TicketLockedError("A ticket in 'done' status is terminal and cannot change status")

    if new_status == ticket.status:
        return ticket  # idempotent no-op

    if new_status not in ALLOWED_TRANSITIONS[ticket.status]:
        raise InvalidTransitionError(
            f"Cannot transition from '{ticket.status.value}' to '{new_status.value}'"
        )

    ticket.status = new_status
    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(db: Session, ticket_id: int) -> None:
    ticket = get_ticket(db, ticket_id)
    db.delete(ticket)
    db.commit()


def _priority_sort_expression():
    """CASE expression mapping priority enum to its severity ordinal for sorting."""
    return case(
        {p.value: ordinal for p, ordinal in PRIORITY_ORDER.items()},
        value=Ticket.priority,
    )


def list_tickets(
    db: Session,
    *,
    status: Status | None = None,
    priority: Priority | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Ticket], int]:
    """Return (items, total) applying filter/search/sort/pagination in SQL."""
    if sort_by not in SORTABLE_FIELDS:
        sort_by = "created_at"

    stmt = select(Ticket)

    if status is not None:
        stmt = stmt.where(Ticket.status == status)
    if priority is not None:
        stmt = stmt.where(Ticket.priority == priority)
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(or_(Ticket.title.ilike(term), Ticket.description.ilike(term)))

    # total count before pagination
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    sort_column = _priority_sort_expression() if sort_by == "priority" else getattr(Ticket, sort_by)
    stmt = stmt.order_by(sort_column.asc() if order == "asc" else sort_column.desc())

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    items = list(db.scalars(stmt).all())
    return items, total
