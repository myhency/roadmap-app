from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/milestones", tags=["milestones"])


@router.get("/", response_model=List[schemas.Milestone])
def get_milestones(goal_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Milestone).options(
        joinedload(models.Milestone.tasks).joinedload(models.Task.assignee)
    )
    if goal_id:
        query = query.filter(models.Milestone.goal_id == goal_id)
    return query.all()


@router.get("/{milestone_id}", response_model=schemas.Milestone)
def get_milestone(milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(models.Milestone).options(
        joinedload(models.Milestone.tasks).joinedload(models.Task.assignee)
    ).filter(models.Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone


@router.post("/", response_model=schemas.Milestone)
def create_milestone(milestone: schemas.MilestoneCreate, db: Session = Depends(get_db)):
    # Check if goal exists
    goal = db.query(models.Goal).filter(models.Goal.id == milestone.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db_milestone = models.Milestone(**milestone.model_dump())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


@router.put("/{milestone_id}", response_model=schemas.Milestone)
def update_milestone(milestone_id: int, milestone: schemas.MilestoneUpdate, db: Session = Depends(get_db)):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    update_data = milestone.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_milestone, key, value)

    db.commit()
    db.refresh(db_milestone)
    return db_milestone


@router.delete("/{milestone_id}")
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == milestone_id).first()
    if not db_milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    db.delete(db_milestone)
    db.commit()
    return {"message": "Milestone deleted successfully"}
