from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    videos = relationship("VideoJob", back_populates="owner")

class VideoJob(Base):
    __tablename__ = 'video_jobs'

    id = Column(String, primary_key=True, index=True) # UUID
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    status = Column(String) # PENDING, PROCESSING, COMPLETED, FAILED
    persona = Column(String)
    result_json_path = Column(String, nullable=True)
    final_video_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="videos")
