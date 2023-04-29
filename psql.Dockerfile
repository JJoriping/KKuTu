FROM postgres:11

COPY db.sql /docker-entrypoint-initdb.d/10-init.sql