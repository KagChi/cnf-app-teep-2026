FROM debian:12-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_INSTALL=/usr/local/bun
ENV PATH=$BUN_INSTALL/bin:$PATH

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun $BUN_INSTALL

# Set working directory
WORKDIR /app

# Copy everything
COPY . .
    
RUN bun install

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