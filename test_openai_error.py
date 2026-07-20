import openai
from openai import APIStatusError
import httpx

response = httpx.Response(401, request=httpx.Request("GET", "https://api.openai.com/v1/"), json={'error': {'message': 'You have insufficient permissions for this operation.', 'type': 'invalid_request_error', 'param': None, 'code': None}})
try:
    raise APIStatusError("Test", response=response, body={'error': {'message': 'You have insufficient permissions for this operation.', 'type': 'invalid_request_error', 'param': None, 'code': None}})
except Exception as e:
    print(str(e))
