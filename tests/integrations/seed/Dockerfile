FROM python:3.12-slim

RUN pip install duckdb

WORKDIR /app

COPY seed.sql .
COPY seed.py .

CMD ["python", "seed.py"]
