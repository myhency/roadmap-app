from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # PM, Developer, Designer, QA, etc.
    team = Column(String(100))
    type = Column(String(20), nullable=False)  # 'existing' or 'new'
    join_date = Column(Date)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tasks = relationship("Task", back_populates="assignee")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False)  # 'issue' or 'feature'
    title = Column(String(200), nullable=False)
    description = Column(Text)
    expected_effect = Column(Text)  # 기대효과
    year = Column(Integer, nullable=False)
    quarter = Column(String(10))  # Q1, Q2, Q3, Q4, or NULL
    team = Column(String(100))
    product = Column(String(100))
    progress = Column(Integer, default=0)  # 0-100
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    start_date = Column(Date)
    progress = Column(Integer, default=0)  # 0-100
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    goal = relationship("Goal", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assignee_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"))
    due_date = Column(Date)
    start_date = Column(Date)
    progress = Column(Integer, default=0)  # 0-100
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    milestone = relationship("Milestone", back_populates="tasks")
    assignee = relationship("Member", back_populates="tasks")


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False)  # 'issue' or 'feature'
    title = Column(String(200), nullable=False)
    description = Column(Text)
    year = Column(Integer, nullable=False)
    product = Column(String(100))
    priority = Column(Integer, default=0)  # 1=High, 2=Medium, 3=Low, 0=None
    status = Column(String(20), default='open')  # 'open', 'approved', 'rejected', 'converted'
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    author = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    idea = relationship("Idea", back_populates="comments")
