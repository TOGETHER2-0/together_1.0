from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.schemas.event import EventCreate, EventOut, EventUpdate, JoinRequestOut, EventMessageOut, EventMessageCreate
from app.models.event import Event, JoinRequest, RequestStatus, EventMessage
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

def build_event_out(event: Event) -> dict:
    approved = [r for r in event.join_requests if r.status == RequestStatus.approved]
    return {
        **EventOut.model_validate(event).model_dump(),
        "approved_count": len(approved),
    }

@router.get("", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .options(
            joinedload(Event.host),
            joinedload(Event.join_requests).joinedload(JoinRequest.user),
        )
        .order_by(Event.event_datetime.asc())
        .all()
    )
    result = []
    for e in events:
        approved = len([r for r in e.join_requests if r.status == RequestStatus.approved])
        out = EventOut.model_validate(e)
        out.approved_count = approved
        result.append(out)
    return result

@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.accommodation == "Odengatan 40" and data.floor is not None:
        if data.floor not in range(1, 5):
            raise HTTPException(status_code=400, detail="Floor must be 1–4 for Odengatan 40")

    event = Event(**data.model_dump(), host_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)

    db_event = (
        db.query(Event)
        .options(joinedload(Event.host), joinedload(Event.join_requests).joinedload(JoinRequest.user))
        .filter(Event.id == event.id)
        .first()
    )
    out = EventOut.model_validate(db_event)
    out.approved_count = 0
    return out

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = (
        db.query(Event)
        .options(joinedload(Event.host), joinedload(Event.join_requests).joinedload(JoinRequest.user))
        .filter(Event.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    approved = len([r for r in event.join_requests if r.status == RequestStatus.approved])
    out = EventOut.model_validate(event)
    out.approved_count = approved
    return out

@router.patch("/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)

    db_event = (
        db.query(Event)
        .options(joinedload(Event.host), joinedload(Event.join_requests).joinedload(JoinRequest.user))
        .filter(Event.id == event.id)
        .first()
    )
    approved = len([r for r in db_event.join_requests if r.status == RequestStatus.approved])
    out = EventOut.model_validate(db_event)
    out.approved_count = approved
    return out

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(event)
    db.commit()

@router.post("/{event_id}/join", response_model=JoinRequestOut, status_code=status.HTTP_201_CREATED)
def request_to_join(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id == current_user.id:
        raise HTTPException(status_code=400, detail="You are the host")

    existing = db.query(JoinRequest).filter(
        JoinRequest.event_id == event_id,
        JoinRequest.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already exists")

    approved_count = db.query(JoinRequest).filter(
        JoinRequest.event_id == event_id,
        JoinRequest.status == RequestStatus.approved
    ).count()
    if approved_count >= event.max_participants:
        raise HTTPException(status_code=400, detail="Event is full")

    req = JoinRequest(event_id=event_id, user_id=current_user.id)
    db.add(req)
    db.commit()
    db.refresh(req)

    return db.query(JoinRequest).options(joinedload(JoinRequest.user)).filter(JoinRequest.id == req.id).first()

@router.patch("/{event_id}/requests/{request_id}", response_model=JoinRequestOut)
def handle_request(
    event_id: int,
    request_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    req = db.query(JoinRequest).filter(JoinRequest.id == request_id, JoinRequest.event_id == event_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if action == "approve":
        approved_count = db.query(JoinRequest).filter(
            JoinRequest.event_id == event_id,
            JoinRequest.status == RequestStatus.approved
        ).count()
        if approved_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Event is full")
        req.status = RequestStatus.approved
    elif action == "reject":
        req.status = RequestStatus.rejected
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")

    db.commit()
    db.refresh(req)
    return db.query(JoinRequest).options(joinedload(JoinRequest.user)).filter(JoinRequest.id == req.id).first()

@router.get("/{event_id}/messages", response_model=List[EventMessageOut])
def get_event_messages(
    event_id: int,
    after: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Controlla se l'utente è iscritto o è l'host
    is_host = event.host_id == current_user.id
    is_enrolled = db.query(JoinRequest).filter(
        JoinRequest.event_id == event_id,
        JoinRequest.user_id == current_user.id,
        JoinRequest.status == RequestStatus.approved
    ).first() is not None

    if not is_host and not is_enrolled:
        raise HTTPException(status_code=403, detail="Not authorized to view messages")

    query = db.query(EventMessage).filter(EventMessage.event_id == event_id)
    if after is not None:
        query = query.filter(EventMessage.id > after)

    messages = query.order_by(EventMessage.created_at.asc()).all()
    return [
        EventMessageOut(
            id=m.id,
            user=m.user,
            text=m.text,
            created_at=m.created_at
        ) for m in messages
    ]

@router.post("/{event_id}/messages", response_model=EventMessageOut, status_code=status.HTTP_201_CREATED)
def create_message(
    event_id: int,
    data: EventMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Controlla se l'utente è iscritto o è l'host
    is_host = event.host_id == current_user.id
    is_enrolled = db.query(JoinRequest).filter(
        JoinRequest.event_id == event_id,
        JoinRequest.user_id == current_user.id,
        JoinRequest.status == RequestStatus.approved
    ).first() is not None

    if not is_host and not is_enrolled:
        raise HTTPException(status_code=403, detail="Not authorized to send messages")

    message = EventMessage(event_id=event_id, user_id=current_user.id, text=data.text)
    db.add(message)
    db.commit()
    db.refresh(message)

    db_message = db.query(EventMessage).options(joinedload(EventMessage.user)).filter(EventMessage.id == message.id).first()
    return EventMessageOut(
        id=db_message.id,
        user=db_message.user,
        text=db_message.text,
        created_at=db_message.created_at
    )
