from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("/", response_model=List[schemas.Member])
def get_members(year: int = None, team: str = None, type: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Member)
    if year:
        query = query.filter(models.Member.year == year)
    if team:
        query = query.filter(models.Member.team == team)
    if type:
        query = query.filter(models.Member.type == type)
    return query.all()


@router.get("/summary")
def get_members_summary(year: int = None, db: Session = Depends(get_db)):
    """Get member statistics including role distribution and product assignments"""
    # Get all members for the year
    members_query = db.query(models.Member)
    if year:
        members_query = members_query.filter(models.Member.year == year)
    all_members = members_query.all()

    # Basic counts
    total = len(all_members)
    existing = len([m for m in all_members if m.type == 'existing'])
    new = len([m for m in all_members if m.type == 'new'])

    # By role
    by_role = {}
    for member in all_members:
        role = member.role or 'Other'
        if role not in by_role:
            by_role[role] = {'total': 0, 'existing': 0, 'new': 0}
        by_role[role]['total'] += 1
        if member.type == 'existing':
            by_role[role]['existing'] += 1
        else:
            by_role[role]['new'] += 1

    # Get product assignments from member's product field (배치 예정)
    by_product = {}
    unassigned_members = []

    for member in all_members:
        member_data = {
            'id': member.id,
            'name': member.name,
            'role': member.role,
            'type': member.type
        }

        if member.product:
            product = member.product
            if product not in by_product:
                by_product[product] = {'members': [], 'count': 0}
            by_product[product]['members'].append(member_data)
            by_product[product]['count'] += 1
        else:
            unassigned_members.append(member_data)

    return {
        'total': total,
        'existing': existing,
        'new': new,
        'by_role': by_role,
        'by_product': by_product,
        'unassigned': {
            'count': len(unassigned_members),
            'members': unassigned_members
        }
    }


@router.get("/{member_id}", response_model=schemas.Member)
def get_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.post("/", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = models.Member(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.put("/{member_id}", response_model=schemas.Member)
def update_member(member_id: int, member: schemas.MemberUpdate, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_data = member.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_member, key, value)

    db.commit()
    db.refresh(db_member)
    return db_member


@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(db_member)
    db.commit()
    return {"message": "Member deleted successfully"}
