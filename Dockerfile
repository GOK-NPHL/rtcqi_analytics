FROM php:7.4-fpm

# Arguments defined in docker-compose.yml
ARG user
ARG uid

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
    mariadb-client \
    openssl \
    libzip-dev \
    # php7.4-common \
    # php-curl \
    # php-json \
    # php-mbstring \
    # php-mysql \
    # php-xml \
    # php-zip \
    sudo \
    cron \
    && docker-php-ext-install zip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

RUN apt-get -y install nodejs

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Set working directory
WORKDIR /var/www

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# increase the memory limit to 1024M
# RUN echo "memory_limit=1024M" > /usr/local/etc/php/conf.d/memory-limit.ini
RUN echo 'memory_limit = 2048M' >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;

# increase the execution time to 150 seconds
RUN echo 'max_execution_time = 150' >> /usr/local/etc/php/conf.d/docker-php-ext-max-execution-time.ini;

# Setup cron job

USER $user
