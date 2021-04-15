FROM mysql:5.7

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    vim \
    net-tools \
    iputils-ping \
    bash

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*