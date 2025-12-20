from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.get("/", response_model=List[schemas.Idea])
def get_ideas(
    year: Optional[int] = None,
    status: Optional[str] = None,
    product: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Idea)
    if year:
        query = query.filter(models.Idea.year == year)
    if status:
        query = query.filter(models.Idea.status == status)
    if product:
        query = query.filter(models.Idea.product == product)
    return query.order_by(models.Idea.priority.asc(), models.Idea.created_at.desc()).all()


@router.get("/{idea_id}", response_model=schemas.Idea)
def get_idea(idea_id: int, db: Session = Depends(get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@router.post("/", response_model=schemas.Idea)
def create_idea(idea: schemas.IdeaCreate, db: Session = Depends(get_db)):
    db_idea = models.Idea(**idea.model_dump())
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea


@router.put("/{idea_id}", response_model=schemas.Idea)
def update_idea(idea_id: int, idea: schemas.IdeaUpdate, db: Session = Depends(get_db)):
    db_idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not db_idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    update_data = idea.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_idea, key, value)

    db.commit()
    db.refresh(db_idea)
    return db_idea


@router.delete("/{idea_id}")
def delete_idea(idea_id: int, db: Session = Depends(get_db)):
    db_idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not db_idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    db.delete(db_idea)
    db.commit()
    return {"message": "Idea deleted successfully"}


# Convert idea to goal
@router.post("/{idea_id}/convert", response_model=schemas.Goal)
def convert_idea_to_goal(idea_id: int, db: Session = Depends(get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    if idea.status == 'converted':
        raise HTTPException(status_code=400, detail="Idea already converted to goal")

    # Create goal from idea
    goal = models.Goal(
        type=idea.type,
        title=idea.title,
        description=idea.description,
        year=idea.year,
        product=idea.product,
        progress=0
    )
    db.add(goal)

    # Update idea status
    idea.status = 'converted'

    db.commit()
    db.refresh(goal)
    return goal


# Comment endpoints
@router.get("/{idea_id}/comments", response_model=List[schemas.Comment])
def get_comments(idea_id: int, db: Session = Depends(get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea.comments


@router.post("/{idea_id}/comments", response_model=schemas.Comment)
def create_comment(idea_id: int, comment: schemas.CommentBase, db: Session = Depends(get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    db_comment = models.Comment(
        idea_id=idea_id,
        author=comment.author,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}
