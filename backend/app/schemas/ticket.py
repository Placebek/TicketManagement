from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ticket import Priority, Status


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=10_000)
    priority: Priority = Priority.medium


class TicketUpdate(BaseModel):
    """Edit title/description. Both optional; at least one should be provided."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    priority: Priority | None = None


class TicketStatusUpdate(BaseModel):
    status: Status


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: Status
    priority: Priority
    created_at: datetime
    updated_at: datetime


class PaginatedTickets(BaseModel):
    items: list[TicketRead]
    total: int
    page: int
    page_size: int
