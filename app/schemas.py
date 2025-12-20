from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


# Member schemas
class MemberBase(BaseModel):
    name: str
    role: str
    team: Optional[str] = None
    type: str  # 'existing' or 'new'
    join_date: Optional[date] = None
    year: int


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    team: Optional[str] = None
    type: Optional[str] = None
    join_date: Optional[date] = None
    year: Optional[int] = None


class Member(MemberBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    progress: int = 0


class TaskCreate(TaskBase):
    milestone_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    progress: Optional[int] = None


class Task(TaskBase):
    id: int
    milestone_id: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[Member] = None

    class Config:
        from_attributes = True


# Milestone schemas
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    progress: int = 0


class MilestoneCreate(MilestoneBase):
    goal_id: int


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    progress: Optional[int] = None


class Milestone(MilestoneBase):
    id: int
    goal_id: int
    created_at: datetime
    updated_at: datetime
    tasks: List[Task] = []

    class Config:
        from_attributes = True


# Goal schemas
class GoalBase(BaseModel):
    type: str  # 'issue' or 'feature'
    title: str
    description: Optional[str] = None
    expected_effect: Optional[str] = None  # 기대효과
    year: int
    quarter: Optional[str] = None
    team: Optional[str] = None
    product: Optional[str] = None
    progress: int = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    expected_effect: Optional[str] = None
    year: Optional[int] = None
    quarter: Optional[str] = None
    team: Optional[str] = None
    product: Optional[str] = None
    progress: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class Goal(GoalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    milestones: List[Milestone] = []

    class Config:
        from_attributes = True


# Dashboard summary
class ProgressSummary(BaseModel):
    total_goals: int
    total_milestones: int
    total_tasks: int
    overall_progress: float
    by_type: dict
    by_team: dict
    by_product: dict


# Comment schemas
class CommentBase(BaseModel):
    author: str
    content: str


class CommentCreate(CommentBase):
    idea_id: int


class Comment(CommentBase):
    id: int
    idea_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Idea schemas
class IdeaBase(BaseModel):
    type: str  # 'issue' or 'feature'
    title: str
    description: Optional[str] = None
    year: int
    product: Optional[str] = None
    priority: int = 0  # 1=High, 2=Medium, 3=Low, 0=None
    status: str = 'open'  # 'open', 'approved', 'rejected', 'converted'


class IdeaCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    year: int
    product: Optional[str] = None


class IdeaUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    product: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None


class Idea(IdeaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    comments: List[Comment] = []

    class Config:
        from_attributes = True
