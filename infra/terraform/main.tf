// LetsGoFood V15 Production Infrastructure
// Cloud SQL (PostgreSQL), GKE, and Memorystore (Redis)

resource "google_container_cluster" "primary" {
  name     = "lgf-v15-prod-cluster"
  location = "europe-west1"
  
  initial_node_count = 3
  
  node_config {
    machine_type = "e2-standard-4"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  monitoring_config {
    managed_service {
      enabled = true
    }
  }
}

resource "google_sql_database_instance" "master" {
  name             = "lgf-v15-master"
  database_version = "POSTGRES_15"
  region           = "europe-west1"

  settings {
    tier = "db-custom-16-65536"
    availability_type = "REGIONAL"
    
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }
}

resource "google_redis_instance" "cache" {
  name           = "lgf-v15-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 5
  region         = "europe-west1"
  authorized_network = google_compute_network.vpc.id
  redis_version = "REDIS_7_0"
}
