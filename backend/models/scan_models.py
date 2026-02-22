from sqlalchemy import Column, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from datetime import datetime
import uuid

class Scan(Base):
    __tablename__ = "scans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    overall_score = Column(Float, default=0.0)
    total_packages = Column(Float, default=0.0)
    high_risk_count = Column(Float, default=0.0)

    dependencies = relationship("Dependency", back_populates="scan")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("scans.id"))
    name = Column(String, nullable=False)
    old_version = Column(String)
    new_version = Column(String)
    diff = Column(Text)
    risk_level = Column(String)
    risk_reason = Column(Text)
    severity_score = Column(Float)

    scan = relationship("Scan", back_populates="dependencies")