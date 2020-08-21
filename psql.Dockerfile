FROM postgres

COPY db.sql /docker-entrypoint-initdb.d/10-init.sql