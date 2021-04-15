# RT-CQI Analytics Portal.

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#Installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project
The RT-CQI Analytics Portal is a platform build on top of the ODK platform to allow for analyses of collected data, user access and report generation.
.

<!-- GETTING STARTED -->
## Getting Started

This project is powered by the laravel framework.


### Prerequisites

1. Install docker and docker-compose on your local machine.

### Installation

* clone project
  ```sh
  git clone https://github.com/GOK-NPHL/rtcqi_analytics
  ```

* cd
  ```sh
  cd rtcqi_analytics/
  ```

* build project
  ```sh
  docker-compose build
  ```

* run project
  ```sh
  docker-compose up -d
  ```

#### Defaults.

Database, web server and PHP settings are done from the docker files.


<!-- LICENSE -->
## License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.
