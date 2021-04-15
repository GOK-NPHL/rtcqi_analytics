FROM nginx:alpine

# Install system dependencies
RUN apk update && apk upgrade  && apk add  \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    vim \
    net-tools \ 
    iputils \
    bash

# Clear cache
#RUN apt-get clean && rm -rf /var/lib/apt/lists/*