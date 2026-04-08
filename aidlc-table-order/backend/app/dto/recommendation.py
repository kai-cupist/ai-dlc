"""Recommendation DTOs — request/response models for C6: Recommendation."""

from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    menu_ids: list[str]


class RecommendedMenu(BaseModel):
    id: str
    name: str
    price: int
    image_url: str | None = None


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendedMenu]
