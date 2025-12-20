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

    # Get product assignments through tasks
    goals_query = db.query(models.Goal)
    if year:
        goals_query = goals_query.filter(models.Goal.year == year)
    all_goals = goals_query.all()

    by_product = {}
    member_products = {}  # member_id -> set of products

    for goal in all_goals:
        product = goal.product or 'Unassigned'
        if product not in by_product:
            by_product[product] = {'members': [], 'member_ids': set()}

        for milestone in goal.milestones:
            for task in milestone.tasks:
                if task.assignee_id and task.assignee:
                    member = task.assignee
                    if member.id not in by_product[product]['member_ids']:
                        by_product[product]['member_ids'].add(member.id)
                        by_product[product]['members'].append({
                            'id': member.id,
                            'name': member.name,
                            'role': member.role,
                            'type': member.type
                        })

                    # Track which products each member is assigned to
                    if member.id not in member_products:
                        member_products[member.id] = set()
                    member_products[member.id].add(product)

    # Convert sets to counts for JSON serialization
    for product in by_product:
        by_product[product]['count'] = len(by_product[product]['members'])
        del by_product[product]['member_ids']

    # Unassigned members (not assigned to any task)
    assigned_member_ids = set(member_products.keys())
    unassigned_members = [
        {'id': m.id, 'name': m.name, 'role': m.role, 'type': m.type}
        for m in all_members if m.id not in assigned_member_ids
    ]

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
