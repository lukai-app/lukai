from typing import TypeVar, Generic
from pydantic import BaseModel


class ToolResponse(BaseModel):
    tool_response: str


# Generic type for different tool responses
T = TypeVar("T")


class MainAPIResponse(BaseModel, Generic[T]):
    success: bool
    data: T


# Example of how to create other tool responses:
# class WeatherToolResponse(BaseModel):
#     temperature: float
#     condition: str
#
# WeatherResponse = MainAPIResponse[WeatherToolResponse]
