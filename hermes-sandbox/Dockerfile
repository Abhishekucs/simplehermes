FROM debian:bookworm-slim

# Copy Blaxel sandbox-api binary (required for Blaxel sandbox management)
COPY --from=ghcr.io/blaxel-ai/sandbox:latest /sandbox-api /usr/local/bin/sandbox-api

RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    tini \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create hermes user
RUN useradd -m -u 10000 -s /bin/bash hermes

# Install Hermes Agent
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Install boto3 for AWS Bedrock LLM provider (uv manages the venv, no pip available)
RUN VIRTUAL_ENV=/usr/local/lib/hermes-agent/venv /root/.local/bin/uv pip install boto3

# Ensure the venv is always on PATH so hermes uses it
ENV PATH="/usr/local/lib/hermes-agent/venv/bin:$PATH"
ENV VIRTUAL_ENV="/usr/local/lib/hermes-agent/venv"

# Set up data directory
RUN mkdir -p /opt/data && chown hermes:hermes /opt/data
VOLUME /opt/data

ENV HERMES_HOME=/opt/data
ENV PYTHONUNBUFFERED=1

USER hermes
WORKDIR /opt/data

EXPOSE 8443

ENTRYPOINT ["tini", "--"]
CMD ["sandbox-api"]
