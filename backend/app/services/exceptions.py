class TicketServiceError(Exception):
    """Base class for ticket business-rule violations."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class TicketNotFoundError(TicketServiceError):
    """The requested ticket does not exist -> 404."""


class TicketLockedError(TicketServiceError):
    """The ticket is in a terminal (done) state and cannot be changed -> 409."""


class InvalidTransitionError(TicketServiceError):
    """The requested status transition is not allowed -> 409."""
