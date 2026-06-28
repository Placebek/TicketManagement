"""Unit tests for the business rules — the part reviewers attack directly."""

import pytest

from app.models.ticket import Priority, Status
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.services import ticket_service
from app.services.exceptions import (
    InvalidTransitionError,
    TicketLockedError,
    TicketNotFoundError,
)


def _make(db, title="T", priority=Priority.medium):
    return ticket_service.create_ticket(db, TicketCreate(title=title, priority=priority))


def test_create_defaults_to_new(db_session):
    t = _make(db_session)
    assert t.status == Status.new
    assert t.id is not None


def test_full_lifecycle_new_to_done(db_session):
    t = _make(db_session)
    t = ticket_service.change_status(db_session, t.id, Status.in_progress)
    assert t.status == Status.in_progress
    t = ticket_service.change_status(db_session, t.id, Status.done)
    assert t.status == Status.done


def test_done_is_terminal_cannot_change_status(db_session):
    t = _make(db_session)
    ticket_service.change_status(db_session, t.id, Status.done)
    with pytest.raises(TicketLockedError):
        ticket_service.change_status(db_session, t.id, Status.in_progress)


def test_done_cannot_be_edited(db_session):
    t = _make(db_session)
    ticket_service.change_status(db_session, t.id, Status.done)
    with pytest.raises(TicketLockedError):
        ticket_service.update_ticket(db_session, t.id, TicketUpdate(title="changed"))


def test_invalid_transition_rejected(db_session):
    # new -> done is allowed; in_progress -> new allowed; but we block reverting from done.
    t = _make(db_session)
    ticket_service.change_status(db_session, t.id, Status.done)
    with pytest.raises(TicketLockedError):
        ticket_service.change_status(db_session, t.id, Status.new)


def test_get_missing_raises(db_session):
    with pytest.raises(TicketNotFoundError):
        ticket_service.get_ticket(db_session, 9999)


def test_status_noop_is_idempotent(db_session):
    t = _make(db_session)
    same = ticket_service.change_status(db_session, t.id, Status.new)
    assert same.status == Status.new


def test_filter_search_sort_paginate(db_session):
    _make(db_session, title="alpha bug", priority=Priority.low)
    _make(db_session, title="beta feature", priority=Priority.high)
    _make(db_session, title="gamma bug", priority=Priority.medium)

    # search
    items, total = ticket_service.list_tickets(db_session, search="bug")
    assert total == 2

    # priority filter
    items, total = ticket_service.list_tickets(db_session, priority=Priority.high)
    assert total == 1 and items[0].title == "beta feature"

    # sort by priority desc -> high first
    items, _ = ticket_service.list_tickets(db_session, sort_by="priority", order="desc")
    assert items[0].priority == Priority.high

    # pagination
    items, total = ticket_service.list_tickets(db_session, page=1, page_size=2)
    assert total == 3 and len(items) == 2
