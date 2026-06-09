# Configurar Backups Automáticos de Firestore

Firebase no tiene backups automáticos en el plan Spark (gratuito).
Hay dos opciones:

---

## Opción A — Plan Blaze + Cloud Scheduler (RECOMENDADA)

1. Upgrade a Blaze en https://console.firebase.google.com/project/rutapets/usage/details

2. Habilitar Cloud Firestore API de exportación:
   ```
   gcloud services enable firestore.googleapis.com
   ```

3. Crear bucket de Cloud Storage para backups:
   ```
   gsutil mb -p rutapets gs://rutapets-backups
   ```

4. Crear Cloud Scheduler job (exporta cada día a las 2 AM):
   ```
   gcloud scheduler jobs create http firestore-daily-backup \
     --schedule="0 2 * * *" \
     --uri="https://firestore.googleapis.com/v1/projects/rutapets/databases/(default):exportDocuments" \
     --message-body='{"outputUriPrefix":"gs://rutapets-backups/$(date +%Y-%m-%d)"}' \
     --oauth-service-account-email=PROJECT_NUMBER-compute@developer.gserviceaccount.com \
     --time-zone="America/Caracas"
   ```

5. Los backups quedan en: gs://rutapets-backups/YYYY-MM-DD/

---

## Opción B — Export manual (GRATIS, plan Spark)

Ejecutar desde la terminal cuando quieras hacer backup:
```bash
gcloud firestore export gs://BUCKET_NAME --project=rutapets
```

O desde Firebase Console:
  Firebase Console > Firestore > Importar/Exportar > Exportar

---

## Restaurar un backup

```bash
gcloud firestore import gs://rutapets-backups/2024-01-15/ --project=rutapets
```

⚠️ La restauración SOBREESCRIBE los datos actuales. Úsala solo en emergencias.
