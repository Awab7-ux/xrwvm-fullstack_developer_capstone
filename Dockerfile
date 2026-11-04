FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ ./
RUN python manage.py migrate && python manage.py loaddata djangoapp/fixtures/initial_data.json
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]