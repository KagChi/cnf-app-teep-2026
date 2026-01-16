FROM docker.io/oven/bun:1.3.5 AS build

# Set working directory
WORKDIR /app

# Install required packages for JS native dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    ca-certificates \
    python3 python-is-python3 \
    tini \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && apt-get autoremove -y \
    && apt-get autoclean -y \
    && rm -rf /var/lib/apt/lists/*

# Copy everything
COPY . .
    
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
    TARGET="bun-linux-x64-modern"; \
    elif [ "$ARCH" = "aarch64" ]; then \
    TARGET="bun-linux-arm64"; \
    else \
    echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    bun build \
    --compile \
    --sourcemap \
    --target $TARGET \
    --outfile dist/cnf-app \
    src/index.ts

FROM docker.io/library/debian:13.2-slim AS prod

COPY --from=build /app/dist/cnf-app /usr/local/bin/cnf-app
CMD ["cnf-app"]