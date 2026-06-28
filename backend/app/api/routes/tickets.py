from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.ticket import Priority, Status
from app.schemas.ticket import (
    PaginatedTickets,
    TicketCreate,
    TicketRead,
    TicketStatusUpdate,
    TicketUpdate,
)
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=PaginatedTickets)
def list_tickets(
    db: Session = Depends(get_db),
    status: Status | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    search: str | None = Query(default=None),
    sort_by: str = Query(default="created_at"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> PaginatedTickets:
    items, total = ticket_service.list_tickets(
        db,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )
    return PaginatedTickets(
        items=[TicketRead.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> TicketRead:
    ticket = ticket_service.create_ticket(db, payload)
    return TicketRead.model_validate(ticket)


@router.get("/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)) -> TicketRead:
    ticket = ticket_service.get_ticket(db, ticket_id)
    return TicketRead.model_validate(ticket)


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)
) -> TicketRead:
    ticket = ticket_service.update_ticket(db, ticket_id, payload)
    return TicketRead.model_validate(ticket)


@router.patch("/{ticket_id}/status", response_model=TicketRead)
def change_status(
    ticket_id: int, payload: TicketStatusUpdate, db: Session = Depends(get_db)
) -> TicketRead:
    ticket = ticket_service.change_status(db, ticket_id, payload.status)
    return TicketRead.model_validate(ticket)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> Response:
    ticket_service.delete_ticket(db, ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
