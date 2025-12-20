from fastapi import FastAPI, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import engine, get_db, Base
from app import models, schemas
from app.routers import goals, milestones, tasks, members, ideas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Roadmap Dashboard", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Include routers
app.include_router(goals.router)
app.include_router(milestones.router)
app.include_router(tasks.router)
app.include_router(members.router)
app.include_router(ideas.router)


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/dashboard/summary", response_model=schemas.ProgressSummary)
def get_dashboard_summary(year: int = None, db: Session = Depends(get_db)):
    # Base query
    goals_query = db.query(models.Goal)
    if year:
        goals_query = goals_query.filter(models.Goal.year == year)

    all_goals = goals_query.all()

    total_goals = len(all_goals)
    total_milestones = 0
    total_tasks = 0
    progress_sum = 0

    by_type = {"issue": {"count": 0, "progress": 0}, "feature": {"count": 0, "progress": 0}, "feedback": {"count": 0, "progress": 0}}
    by_team = {}
    by_product = {}

    for goal in all_goals:
        total_milestones += len(goal.milestones)
        progress_sum += goal.progress

        # By type
        if goal.type in by_type:
            by_type[goal.type]["count"] += 1
            by_type[goal.type]["progress"] += goal.progress

        # By team
        team = goal.team or "Unassigned"
        if team not in by_team:
            by_team[team] = {"count": 0, "progress": 0}
        by_team[team]["count"] += 1
        by_team[team]["progress"] += goal.progress

        # By product
        product = goal.product or "Unassigned"
        if product not in by_product:
            by_product[product] = {"count": 0, "progress": 0}
        by_product[product]["count"] += 1
        by_product[product]["progress"] += goal.progress

        for milestone in goal.milestones:
            total_tasks += len(milestone.tasks)

    # Calculate averages
    overall_progress = progress_sum / total_goals if total_goals > 0 else 0

    for key in by_type:
        if by_type[key]["count"] > 0:
            by_type[key]["progress"] = by_type[key]["progress"] / by_type[key]["count"]

    for key in by_team:
        if by_team[key]["count"] > 0:
            by_team[key]["progress"] = by_team[key]["progress"] / by_team[key]["count"]

    for key in by_product:
        if by_product[key]["count"] > 0:
            by_product[key]["progress"] = by_product[key]["progress"] / by_product[key]["count"]

    return schemas.ProgressSummary(
        total_goals=total_goals,
        total_milestones=total_milestones,
        total_tasks=total_tasks,
        overall_progress=overall_progress,
        by_type=by_type,
        by_team=by_team,
        by_product=by_product
    )


@app.get("/api/years")
def get_available_years(db: Session = Depends(get_db)):
    """Get all unique years from goals, members, and ideas"""
    years = set()

    # From goals
    goal_years = db.query(models.Goal.year).distinct().all()
    years.update([y[0] for y in goal_years])

    # From members
    member_years = db.query(models.Member.year).distinct().all()
    years.update([y[0] for y in member_years])

    # From ideas
    idea_years = db.query(models.Idea.year).distinct().all()
    years.update([y[0] for y in idea_years])

    # Default to 2026 if no data
    if not years:
        years.add(2026)

    return sorted(years, reverse=True)


@app.get("/api/gantt/data")
def get_gantt_data(year: int = None, db: Session = Depends(get_db)):
    """Get data formatted for Frappe Gantt"""
    goals_query = db.query(models.Goal)
    if year:
        goals_query = goals_query.filter(models.Goal.year == year)

    all_goals = goals_query.all()
    gantt_tasks = []

    for goal in all_goals:
        # Add goal as a task
        gantt_tasks.append({
            "id": f"goal-{goal.id}",
            "name": goal.title,
            "start": goal.start_date.isoformat() if goal.start_date else None,
            "end": goal.end_date.isoformat() if goal.end_date else None,
            "progress": goal.progress,
            "type": "goal",
            "goal_type": goal.type,
            "dependencies": ""
        })

        for milestone in goal.milestones:
            gantt_tasks.append({
                "id": f"milestone-{milestone.id}",
                "name": f"  {milestone.title}",
                "start": milestone.start_date.isoformat() if milestone.start_date else None,
                "end": milestone.due_date.isoformat() if milestone.due_date else None,
                "progress": milestone.progress,
                "type": "milestone",
                "dependencies": f"goal-{goal.id}"
            })

            for task in milestone.tasks:
                gantt_tasks.append({
                    "id": f"task-{task.id}",
                    "name": f"    {task.title}",
                    "start": task.start_date.isoformat() if task.start_date else None,
                    "end": task.due_date.isoformat() if task.due_date else None,
                    "progress": task.progress,
                    "type": "task",
                    "dependencies": f"milestone-{milestone.id}"
                })

    return gantt_tasks


# [TEST] Delete all data - Remove after testing
@app.delete("/api/reset-all-data")
def reset_all_data(db: Session = Depends(get_db)):
    """Delete all data from all tables - FOR TESTING ONLY"""
    db.query(models.Comment).delete()
    db.query(models.Idea).delete()
    db.query(models.Task).delete()
    db.query(models.Milestone).delete()
    db.query(models.Goal).delete()
    db.query(models.Member).delete()
    db.commit()
    return {"message": "All data has been deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
