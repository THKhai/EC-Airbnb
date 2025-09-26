FROM python:3.11-slim

# Set environment variables
ENV POETRY_VERSION=1.8.2 \
	PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
	&& apt-get install --no-install-recommends -y build-essential curl \
	&& pip install --upgrade pip \
	&& pip install "poetry==$POETRY_VERSION" \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only poetry files first for caching
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
	&& poetry install --no-interaction --no-ansi --only main

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]